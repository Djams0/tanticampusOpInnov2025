const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// --- Récupérer les détails d'une tontine ---
router.get('/:tontine_id', authenticateToken, async (req, res) => {
  try {
    const { tontine_id } = req.params;

    // Infos de base + admin
    const [[tontine]] = await db.query(`
      SELECT t.*, u.first_name as admin_first_name, u.last_name as admin_last_name
      FROM tontines t
      JOIN users u ON t.admin_id = u.user_id
      WHERE t.tontine_id = ?
    `, [tontine_id]);

    if (!tontine) return res.status(404).json({ error: 'Tontine non trouvée' });

    // Participants actifs
    const [participants] = await db.query(`
      SELECT tp.*, u.first_name, u.last_name, u.trust_score
      FROM tontine_participants tp
      JOIN users u ON tp.user_id = u.user_id
      WHERE tp.tontine_id = ? AND tp.is_active = 1
    `, [tontine_id]);

    // Demandes en attente
    const [pendingRequests] = await db.query(`
      SELECT jr.*, u.first_name, u.last_name, u.trust_score
      FROM join_requests jr
      JOIN users u ON jr.user_id = u.user_id
      WHERE jr.tontine_id = ? AND jr.status = 'pending'
    `, [tontine_id]);

    // Cycle actif
    const [[currentCycle]] = await db.query(`
      SELECT * FROM tontine_cycles
      WHERE tontine_id = ? AND status = 'active'
      ORDER BY start_date DESC LIMIT 1
    `, [tontine_id]);

    // Prochain bénéficiaire
    let nextBeneficiary = null;
    if (currentCycle) {
      const [[beneficiary]] = await db.query(`
        SELECT tp.user_id, u.first_name, u.last_name
        FROM tontine_participants tp
        JOIN users u ON tp.user_id = u.user_id
        WHERE tp.tontine_id = ? AND tp.has_received = 0 AND tp.is_active = 1
        ORDER BY tp.join_date ASC LIMIT 1
      `, [tontine_id]);
      nextBeneficiary = beneficiary;
    }

    // Cagnotte actuelle
    const [[pot]] = await db.query(`
      SELECT 
        COUNT(*) as paid_count,
        COUNT(*) * t.contribution_amount as total_amount
      FROM transactions tr
      JOIN tontines t ON tr.tontine_id = t.tontine_id
      WHERE tr.tontine_id = ? AND tr.type = 'contribution'
      AND tr.transaction_date >= (
        SELECT start_date FROM tontine_cycles
        WHERE tontine_id = ? AND status = 'active'
        ORDER BY start_date DESC LIMIT 1
      )
    `, [tontine_id, tontine_id]);

    res.json({
      tontine,
      participants,
      pendingRequests,
      currentCycle,
      nextBeneficiary,
      pot: {
        currentAmount: pot.total_amount || 0,
        paidCount: pot.paid_count || 0,
        totalParticipants: participants.length
      }
    });
  } catch (err) {
    console.error('Erreur détails tontine:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- Gestion des demandes d’adhésion (accept/reject) ---
router.post('/handle-request', authenticateToken, async (req, res) => {
  const { request_id, action } = req.body;

  if (!request_id || !['accept', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [[request]] = await connection.query(`
      SELECT jr.*, t.admin_id
      FROM join_requests jr
      JOIN tontines t ON jr.tontine_id = t.tontine_id
      WHERE jr.request_id = ?
    `, [request_id]);

    if (!request) {
      await connection.rollback();
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    // Vérification rôle admin/coadmin
    const [[isAdmin]] = await connection.query(`
      SELECT 1 FROM tontine_participants
      WHERE tontine_id = ? AND user_id = ? AND role IN ('admin', 'coadmin')
    `, [request.tontine_id, req.user.id]);

    if (!isAdmin) {
      await connection.rollback();
      return res.status(403).json({ error: 'Action non autorisée' });
    }

    // Mise à jour du statut
    await connection.query(`
      UPDATE join_requests SET status = ?, responded_at = NOW()
      WHERE request_id = ?
    `, [action === 'accept' ? 'accepted' : 'rejected', request_id]);

    if (action === 'accept') {
      // Ajout participant + notification
      await connection.query(`
        INSERT INTO tontine_participants (tontine_id, user_id, role, join_date)
        VALUES (?, ?, 'participant', NOW())
      `, [request.tontine_id, request.user_id]);

      await connection.query(`
        INSERT INTO notifications (user_id, tontine_id, type, content)
        VALUES (?, ?, 'system', 'Votre demande pour la tontine a été acceptée')
      `, [request.user_id, request.tontine_id]);
    }

    await connection.commit();
    res.json({ success: true, message: `Demande ${action === 'accept' ? 'acceptée' : 'rejetée'}` });
  } catch (err) {
    await connection.rollback();
    console.error('Erreur gestion demande:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    connection.release();
  }
});

// --- Mise à jour de l’ordre des bénéficiaires ---
router.post('/update-beneficiary-order', authenticateToken, async (req, res) => {
  const { tontine_id, new_order } = req.body;

  if (!tontine_id || !Array.isArray(new_order)) {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }

  const connection = await db.getConnection(); // ⬅️ On récupère une connexion

  try {
    await connection.beginTransaction();

    // Vérification admin
    const [[isAdmin]] = await connection.query(`
      SELECT 1 FROM tontines WHERE tontine_id = ? AND admin_id = ?
    `, [tontine_id, req.user.id]);

    if (!isAdmin) {
      await connection.rollback();
      connection.release();
      return res.status(403).json({ error: 'Action non autorisée' });
    }

    // Vérifier que la tontine n’a pas commencé
    const [[tontine]] = await connection.query(`
      SELECT status FROM tontines WHERE tontine_id = ?
    `, [tontine_id]);

    if (tontine.status !== 'pending') {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ error: 'La tontine a déjà commencé' });
    }

    // Mise à jour de la date de join_date
    for (const [index, user_id] of new_order.entries()) {
      await connection.query(`
        UPDATE tontine_participants
        SET join_date = DATE_ADD(NOW(), INTERVAL ? SECOND)
        WHERE tontine_id = ? AND user_id = ?
      `, [index, tontine_id, user_id]);
    }

    await connection.commit();
    connection.release();
    res.json({ success: true, message: 'Ordre mis à jour' });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('Erreur mise à jour ordre:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- Envoyer un avertissement à un participant ---
router.post('/warn-participant', authenticateToken, async (req, res) => {
  const { tontine_id, user_id, reason } = req.body;

  if (!tontine_id || !user_id || !reason) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }

  const connection = await db.getConnection(); // ➜ Connexion individuelle depuis le pool

  try {
    await connection.beginTransaction();

    // Vérifier admin ou coadmin
    const [[isAdmin]] = await connection.query(`
      SELECT 1 FROM tontine_participants
      WHERE tontine_id = ? AND user_id = ? AND role IN ('admin', 'coadmin')
    `, [tontine_id, req.user.id]);

    if (!isAdmin) {
      await connection.rollback();
      connection.release();
      return res.status(403).json({ error: 'Action non autorisée' });
    }

    // Vérifier que le participant est actif
    const [[participant]] = await connection.query(`
      SELECT 1 FROM tontine_participants
      WHERE tontine_id = ? AND user_id = ? AND is_active = 1
    `, [tontine_id, user_id]);

    if (!participant) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: 'Participant non trouvé' });
    }

    // Baisser le score de confiance
    await connection.query(`
      UPDATE users
      SET trust_score = GREATEST(0, trust_score - 10),
          score_last_updated = NOW()
      WHERE user_id = ?
    `, [user_id]);

    // Créer notification d'avertissement
    await connection.query(`
      INSERT INTO notifications (user_id, tontine_id, type, content)
      VALUES (?, ?, 'warning', ?)
    `, [user_id, tontine_id, `Avertissement: ${reason}`]);

    await connection.commit();
    connection.release();

    res.json({ success: true, message: 'Avertissement envoyé' });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('Erreur avertissement:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- Envoyer un message de groupe ---
router.post('/send-group-message', authenticateToken, async (req, res) => {
  const { tontine_id, content } = req.body;

  if (!tontine_id || !content) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Vérifier que l’utilisateur est membre actif
    const [[isMember]] = await connection.query(`
      SELECT 1 FROM tontine_participants
      WHERE tontine_id = ? AND user_id = ? AND is_active = 1
    `, [tontine_id, req.user.id]);

    if (!isMember) {
      await connection.rollback();
      connection.release();
      return res.status(403).json({ error: 'Action non autorisée' });
    }

    // Enregistrer le message
    const [result] = await connection.query(`
      INSERT INTO group_messages (tontine_id, sender_id, content)
      VALUES (?, ?, ?)
    `, [tontine_id, req.user.id, content]);

    // Créer une notification pour chaque autre membre actif
    const [members] = await connection.query(`
      SELECT user_id FROM tontine_participants
      WHERE tontine_id = ? AND user_id != ? AND is_active = 1
    `, [tontine_id, req.user.id]);

    for (const member of members) {
      await connection.query(`
        INSERT INTO notifications (user_id, tontine_id, type, content)
        VALUES (?, ?, 'group_message', 'Nouveau message dans la tontine')
      `, [member.user_id, tontine_id]);
    }

    await connection.commit();
    connection.release();

    res.json({
      success: true,
      message: 'Message envoyé',
      message_id: result.insertId
    });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('Erreur message groupe:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- Récupérer messages de groupe ---
router.get('/group-messages/:tontine_id', authenticateToken, async (req, res) => {
  try {
    const { tontine_id } = req.params;

    // Vérifier que l’utilisateur est membre actif
    const [[isMember]] = await db.query(`
      SELECT 1 FROM tontine_participants
      WHERE tontine_id = ? AND user_id = ? AND is_active = 1
    `, [tontine_id, req.user.id]);

    if (!isMember) {
      return res.status(403).json({ error: 'Action non autorisée' });
    }

    const [messages] = await db.query(`
      SELECT gm.message_id, gm.content, gm.sent_at,
             u.user_id, u.first_name, u.last_name
      FROM group_messages gm
      JOIN users u ON gm.sender_id = u.user_id
      WHERE gm.tontine_id = ?
      ORDER BY gm.sent_at DESC
      LIMIT 50
    `, [tontine_id]);

    // Renvoyer du plus ancien au plus récent
    res.json(messages.reverse());
  } catch (err) {
    console.error('Erreur messages groupe:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- Supprimer un participant avant début ---
router.post('/remove-participant', authenticateToken, async (req, res) => {
  const { tontine_id, user_id } = req.body;

  if (!tontine_id || !user_id) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Vérifier si l'utilisateur est admin de la tontine
    const [[isAdmin]] = await connection.query(`
      SELECT 1 FROM tontines WHERE tontine_id = ? AND admin_id = ?
    `, [tontine_id, req.user.id]);

    if (!isAdmin) {
      await connection.rollback();
      connection.release();
      return res.status(403).json({ error: 'Action non autorisée' });
    }

    // Vérifier que la tontine n’a pas commencé
    const [[tontine]] = await connection.query(`
      SELECT status FROM tontines WHERE tontine_id = ?
    `, [tontine_id]);

    if (tontine.status !== 'pending') {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ error: 'La tontine a déjà commencé' });
    }

    // Supprimer le participant
    await connection.query(`
      DELETE FROM tontine_participants
      WHERE tontine_id = ? AND user_id = ?
    `, [tontine_id, user_id]);

    await connection.commit();
    connection.release();

    res.json({ success: true, message: 'Participant supprimé' });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('Erreur suppression participant:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
