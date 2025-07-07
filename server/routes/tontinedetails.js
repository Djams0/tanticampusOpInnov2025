const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Récupérer les infos de base d'une tontine
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const tontineId = req.params.id;

    // Infos de base de la tontine
    const [[tontine]] = await db.query(
      `SELECT 
        t.title, 
        t.admin_id,
        t.contribution_amount,
        (SELECT SUM(amount) FROM transactions WHERE tontine_id = ? AND type = 'contribution') as current_pot,
        (SELECT CONCAT(first_name, ' ', last_name) FROM users WHERE user_id = (
          SELECT beneficiary_id FROM tontine_cycles 
          WHERE tontine_id = ? AND status = 'active' 
          ORDER BY start_date DESC LIMIT 1
        )) as next_beneficiary
       FROM tontines t
       WHERE t.tontine_id = ?`,
      [tontineId, tontineId, tontineId]
    );

    if (!tontine) {
      return res.status(404).json({ error: 'Tontine non trouvée' });
    }

    res.json({
      title: tontine.title,
      isAdmin: tontine.admin_id === req.user.id,
      currentPot: tontine.current_pot || 0,
      nextBeneficiary: tontine.next_beneficiary || 'À déterminer',
      contributionAmount: tontine.contribution_amount
    });
  } catch (err) {
    console.error('Erreur récupération tontine:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les participants d'une tontine
router.get('/:id/participants', authenticateToken, async (req, res) => {
  try {
    const [participants] = await db.query(
      `SELECT 
        u.user_id,
        CONCAT(u.first_name, ' ', u.last_name) as name,
        CONCAT(LEFT(u.first_name, 1), LEFT(u.last_name, 1)) as initials,
        tp.role,
        tp.has_received,
        u.trust_score,
        (SELECT COUNT(*) FROM transactions 
         WHERE user_id = u.user_id AND tontine_id = ? AND type = 'contribution'
         AND transaction_date >= (SELECT start_date FROM tontine_cycles 
                                 WHERE tontine_id = ? AND status = 'active'
                                 ORDER BY start_date DESC LIMIT 1)
        ) > 0 as has_paid
       FROM tontine_participants tp
       JOIN users u ON tp.user_id = u.user_id
       WHERE tp.tontine_id = ? AND tp.is_active = 1
       ORDER BY tp.join_date ASC`,
      [req.params.id, req.params.id, req.params.id]
    );

    res.json(participants);
  } catch (err) {
    console.error('Erreur récupération participants:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Changer l'ordre des bénéficiaires (admin seulement)
router.post('/:id/order-beneficiaries', authenticateToken, async (req, res) => {
  try {
    const tontineId = req.params.id;
    const { newOrder } = req.body;

    // Vérifier que l'utilisateur est admin
    const [[tontine]] = await db.query(
      'SELECT admin_id FROM tontines WHERE tontine_id = ?',
      [tontineId]
    );

    if (tontine.admin_id !== req.user.id) {
      return res.status(403).json({ error: 'Action réservée à l\'admin' });
    }

    await db.beginTransaction();

    // Réinitialiser l'ordre actuel
    await db.query(
      'UPDATE tontine_participants SET has_received = 0 WHERE tontine_id = ?',
      [tontineId]
    );

    // Mettre à jour l'ordre selon le tableau newOrder
    for (const [index, userId] of newOrder.entries()) {
      await db.query(
        'UPDATE tontine_participants SET join_date = ? WHERE tontine_id = ? AND user_id = ?',
        [new Date(Date.now() + index), tontineId, userId]
      );
    }

    await db.commit();
    res.json({ success: true, message: 'Ordre des bénéficiaires mis à jour' });
  } catch (err) {
    await db.rollback();
    console.error('Erreur modification ordre bénéficiaires:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Envoyer un avertissement (admin seulement)
router.post('/:id/warn-user', authenticateToken, async (req, res) => {
  try {
    const tontineId = req.params.id;
    const { userId, reason } = req.body;

    // Vérifier que l'utilisateur est admin
    const [[tontine]] = await db.query(
      'SELECT admin_id FROM tontines WHERE tontine_id = ?',
      [tontineId]
    );

    if (tontine.admin_id !== req.user.id) {
      return res.status(403).json({ error: 'Action réservée à l\'admin' });
    }

    await db.beginTransaction();

    // Créer la notification
    await db.query(
      `INSERT INTO notifications (user_id, tontine_id, type, content) 
       VALUES (?, ?, 'warning', ?)`,
      [userId, tontineId, `Avertissement: ${reason}`]
    );

    // Diminuer le trust_score
    await db.query(
      'UPDATE users SET trust_score = GREATEST(0, trust_score - 10) WHERE user_id = ?',
      [userId]
    );

    await db.commit();
    res.json({ success: true, message: 'Avertissement envoyé' });
  } catch (err) {
    await db.rollback();
    console.error('Erreur envoi avertissement:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Envoyer un message de groupe
router.post('/:id/group-message', authenticateToken, async (req, res) => {
  try {
    const tontineId = req.params.id;
    const { content } = req.body;

    // Enregistrer le message
    await db.query(
      `INSERT INTO group_messages (tontine_id, sender_id, content) 
       VALUES (?, ?, ?)`,
      [tontineId, req.user.id, content]
    );

    // Créer des notifications pour tous les participants
    const [participants] = await db.query(
      'SELECT user_id FROM tontine_participants WHERE tontine_id = ? AND user_id != ?',
      [tontineId, req.user.id]
    );

    for (const participant of participants) {
      await db.query(
        `INSERT INTO notifications (user_id, tontine_id, type, content) 
         VALUES (?, ?, 'group_message', ?)`,
        [participant.user_id, tontineId, `Nouveau message dans ${tontineId}`]
      );
    }

    res.json({ success: true, message: 'Message envoyé' });
  } catch (err) {
    console.error('Erreur envoi message groupe:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les messages de groupe
router.get('/:id/group-messages', authenticateToken, async (req, res) => {
  try {
    const [messages] = await db.query(
      `SELECT 
        gm.message_id,
        gm.content,
        gm.sent_at,
        CONCAT(u.first_name, ' ', u.last_name) as sender_name,
        u.user_id = ? as is_me
       FROM group_messages gm
       JOIN users u ON gm.sender_id = u.user_id
       WHERE gm.tontine_id = ?
       ORDER BY gm.sent_at ASC`,
      [req.user.id, req.params.id]
    );

    res.json(messages);
  } catch (err) {
    console.error('Erreur récupération messages groupe:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Envoyer un message privé
router.post('/private-message', authenticateToken, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    // Enregistrer le message
    await db.query(
      `INSERT INTO messages (sender_id, receiver_id, content) 
       VALUES (?, ?, ?)`,
      [req.user.id, receiverId, content]
    );

    // Créer une notification
    await db.query(
      `INSERT INTO notifications (user_id, type, content) 
       VALUES (?, 'private_message', ?)`,
      [receiverId, `Nouveau message privé`]
    );

    res.json({ success: true, message: 'Message envoyé' });
  } catch (err) {
    console.error('Erreur envoi message privé:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les messages privés
router.get('/private-messages/:userId', authenticateToken, async (req, res) => {
  try {
    const [messages] = await db.query(
      `SELECT 
        m.message_id,
        m.content,
        m.sent_at,
        CONCAT(u.first_name, ' ', u.last_name) as sender_name,
        u.user_id = ? as is_me
       FROM messages m
       JOIN users u ON m.sender_id = u.user_id
       WHERE (m.sender_id = ? AND m.receiver_id = ?)
       OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.sent_at ASC`,
      [req.user.id, req.user.id, req.params.userId, req.params.userId, req.user.id]
    );

    res.json(messages);
  } catch (err) {
    console.error('Erreur récupération messages privés:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer le calendrier des bénéficiaires
router.get('/:id/calendar', authenticateToken, async (req, res) => {
  try {
    const [calendar] = await db.query(
      `SELECT 
        CONCAT(LEFT(u.first_name, 1), LEFT(u.last_name, 1)) as initials,
        CONCAT(u.first_name, ' ', u.last_name) as name,
        DATE_FORMAT(tc.payout_date, '%M %Y') as date
       FROM tontine_cycles tc
       JOIN users u ON tc.beneficiary_id = u.user_id
       WHERE tc.tontine_id = ? AND tc.status = 'completed'
       ORDER BY tc.payout_date ASC`,
      [req.params.id]
    );

    res.json(calendar);
  } catch (err) {
    console.error('Erreur récupération calendrier:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;