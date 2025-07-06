const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Récupérer le solde et les informations de base
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [[user]] = await db.query(
      'SELECT first_name, last_name, wallet_balance FROM users WHERE user_id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      firstName: user.first_name,
      lastName: user.last_name,
      balance: user.wallet_balance
    });
  } catch (err) {
    console.error('Erreur wallet info:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Historique des transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const [transactions] = await db.query(
      `SELECT 
        transaction_id,
        tontine_id,
        type,
        amount,
        transaction_date,
        (SELECT title FROM tontines WHERE tontine_id = transactions.tontine_id) as tontine_title
       FROM transactions 
       WHERE user_id = ? 
       ORDER BY transaction_date DESC`,
      [req.user.id]
    );

    res.json(transactions);
  } catch (err) {
    console.error('Erreur transactions:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Dépôt d'argent
router.post('/deposit', authenticateToken, async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Montant invalide' });
  }

  try {
    await db.beginTransaction();

    // Enregistrement de la transaction
    await db.query(
      `INSERT INTO transactions (user_id, type, amount) 
       VALUES (?, 'deposit', ?)`,
      [req.user.id, amount]
    );

    // Mise à jour du solde
    await db.query(
      `UPDATE users 
       SET wallet_balance = wallet_balance + ? 
       WHERE user_id = ?`,
      [amount, req.user.id]
    );

    await db.commit();
    res.json({ success: true, message: 'Dépôt effectué' });
  } catch (err) {
    await db.rollback();
    console.error('Erreur dépôt:', err);
    res.status(500).json({ error: 'Erreur lors du dépôt' });
  }
});

// Retrait d'argent
router.post('/withdraw', authenticateToken, async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Montant invalide' });
  }

  try {
    await db.beginTransaction();

    // Vérification du solde
    const [[user]] = await db.query(
      `SELECT wallet_balance FROM users WHERE user_id = ? FOR UPDATE`,
      [req.user.id]
    );

    if (user.wallet_balance < amount) {
      await db.rollback();
      return res.status(400).json({ error: 'Solde insuffisant' });
    }

    // Enregistrement de la transaction
    await db.query(
      `INSERT INTO transactions (user_id, type, amount) 
       VALUES (?, 'withdrawal', ?)`,
      [req.user.id, amount]
    );

    // Mise à jour du solde
    await db.query(
      `UPDATE users 
       SET wallet_balance = wallet_balance - ? 
       WHERE user_id = ?`,
      [amount, req.user.id]
    );

    await db.commit();
    res.json({ success: true, message: 'Retrait effectué' });
  } catch (err) {
    await db.rollback();
    console.error('Erreur retrait:', err);
    res.status(500).json({ error: 'Erreur lors du retrait' });
  }
});

// Paiement d'une cotisation
router.post('/pay-contribution', authenticateToken, async (req, res) => {
  const { tontine_id } = req.body;

  if (!tontine_id) {
    return res.status(400).json({ error: 'ID de tontine requis' });
  }

  try {
    await db.beginTransaction();

    // Récupération des infos tontine
    const [[tontine]] = await db.query(
      `SELECT 
        t.contribution_amount,
        t.status,
        tp.is_active,
        (SELECT cycle_id FROM tontine_cycles 
         WHERE tontine_id = ? AND status = 'active' 
         ORDER BY start_date DESC LIMIT 1) as current_cycle_id
       FROM tontines t
       JOIN tontine_participants tp ON t.tontine_id = tp.tontine_id
       WHERE t.tontine_id = ? AND tp.user_id = ?`,
      [tontine_id, tontine_id, req.user.id]
    );

    if (!tontine) {
      await db.rollback();
      return res.status(404).json({ error: 'Tontine non trouvée' });
    }

    // Validations
    if (tontine.status !== 'active') {
      await db.rollback();
      return res.status(400).json({ error: 'Tontine non active' });
    }

    if (!tontine.is_active) {
      await db.rollback();
      return res.status(400).json({ error: 'Vous êtes inactif dans cette tontine' });
    }

    if (!tontine.current_cycle_id) {
      await db.rollback();
      return res.status(400).json({ error: 'Aucun cycle actif pour cette tontine' });
    }

    // Vérification paiement existant
    const [[hasPaid]] = await db.query(
      `SELECT 1 FROM transactions 
       WHERE user_id = ? AND tontine_id = ? AND type = 'contribution'
       AND transaction_date >= (SELECT start_date FROM tontine_cycles WHERE cycle_id = ?)`,
      [req.user.id, tontine_id, tontine.current_cycle_id]
    );

    if (hasPaid) {
      await db.rollback();
      return res.status(400).json({ error: 'Vous avez déjà payé pour ce cycle' });
    }

    // Vérification solde
    const [[user]] = await db.query(
      `SELECT wallet_balance FROM users WHERE user_id = ? FOR UPDATE`,
      [req.user.id]
    );

    if (user.wallet_balance < tontine.contribution_amount) {
      await db.rollback();
      return res.status(400).json({ error: 'Solde insuffisant' });
    }

    // Paiement de la cotisation
    await db.query(
      `INSERT INTO transactions (user_id, tontine_id, type, amount) 
       VALUES (?, ?, 'contribution', ?)`,
      [req.user.id, tontine_id, tontine.contribution_amount]
    );

    // Mise à jour solde
    await db.query(
      `UPDATE users 
       SET wallet_balance = wallet_balance - ? 
       WHERE user_id = ?`,
      [tontine.contribution_amount, req.user.id]
    );

    // Vérification si tous ont payé
    const [participants] = await db.query(
      `SELECT 
        tp.user_id,
        (SELECT COUNT(*) FROM transactions tr 
         WHERE tr.user_id = tp.user_id AND 
               tr.tontine_id = ? AND 
               tr.type = 'contribution' AND
               tr.transaction_date >= (SELECT start_date FROM tontine_cycles WHERE cycle_id = ?)
        ) as has_paid
       FROM tontine_participants tp
       WHERE tp.tontine_id = ? AND tp.is_active = 1`,
      [tontine_id, tontine.current_cycle_id, tontine_id]
    );

    const allPaid = participants.every(p => p.has_paid > 0);
    let payoutData = { payoutTriggered: false };

    if (allPaid) {
      // Sélection du bénéficiaire
      const [[beneficiary]] = await db.query(
        `SELECT user_id FROM tontine_participants 
         WHERE tontine_id = ? AND has_received = 0 AND is_active = 1
         ORDER BY join_date ASC LIMIT 1`,
        [tontine_id]
      );

      if (beneficiary) {
        const payoutAmount = tontine.contribution_amount * participants.length;

        // Enregistrement payout
        await db.query(
          `INSERT INTO transactions (user_id, tontine_id, type, amount) 
           VALUES (?, ?, 'payout', ?)`,
          [beneficiary.user_id, tontine_id, payoutAmount]
        );

        // Mise à jour solde bénéficiaire
        await db.query(
          `UPDATE users 
           SET wallet_balance = wallet_balance + ? 
           WHERE user_id = ?`,
          [payoutAmount, beneficiary.user_id]
        );

        // Marquer comme ayant reçu
        await db.query(
          `UPDATE tontine_participants 
           SET has_received = 1 
           WHERE tontine_id = ? AND user_id = ?`,
          [tontine_id, beneficiary.user_id]
        );

        // Clôturer le cycle
        await db.query(
          `UPDATE tontine_cycles 
           SET 
             status = 'completed',
             end_date = NOW(),
             beneficiary_id = ?,
             payout_date = NOW(),
             total_amount = ?
           WHERE cycle_id = ?`,
          [beneficiary.user_id, payoutAmount, tontine.current_cycle_id]
        );

        // Créer un nouveau cycle si la tontine continue
        await db.query(
          `INSERT INTO tontine_cycles 
           (tontine_id, start_date, status, amount_per_participant) 
           VALUES (?, NOW(), 'active', ?)`,
          [tontine_id, tontine.contribution_amount]
        );

        payoutData = { 
          payoutTriggered: true,
          beneficiaryId: beneficiary.user_id,
          amount: payoutAmount
        };
      }
    }

    await db.commit();
    res.json({ 
      success: true, 
      message: 'Cotisation payée avec succès',
      ...payoutData
    });
  } catch (err) {
    await db.rollback();
    console.error('Erreur paiement cotisation:', err);
    res.status(500).json({ error: 'Erreur lors du paiement' });
  }
});

module.exports = router;