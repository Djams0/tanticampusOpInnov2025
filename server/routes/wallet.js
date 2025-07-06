// routes/wallet.js
const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Récupérer le solde et l'historique des transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupérer le solde
    const [[user]] = await db.query(
      'SELECT wallet_balance FROM Users WHERE user_id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Récupérer l'historique des transactions
    const [transactions] = await db.query(
      `SELECT 
        t.transaction_id,
        t.amount,
        t.type,
        t.transaction_date,
        ton.title AS tontine_title
       FROM transactions t
       LEFT JOIN tontines ton ON t.tontine_id = ton.tontine_id
       WHERE t.user_id = ?
       ORDER BY t.transaction_date DESC
       LIMIT 50`,
      [userId]
    );

    res.json({
      balance: user.wallet_balance,
      transactions: transactions.map(tx => ({
        id: tx.transaction_id,
        amount: tx.amount,
        type: tx.type,
        date: tx.transaction_date,
        tontine: tx.tontine_title || null
      }))
    });
  } catch (err) {
    console.error('Erreur dans /wallet:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Effectuer un dépôt
router.post('/deposit', authenticateToken, async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.id;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Montant invalide' });
  }

  try {
    await db.beginTransaction();

    // Créer la transaction
    await db.query(
      'INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)',
      [userId, 'deposit', amount]
    );

    // Mettre à jour le solde
    await db.query(
      'UPDATE Users SET wallet_balance = wallet_balance + ? WHERE user_id = ?',
      [amount, userId]
    );

    await db.commit();

    // Récupérer le nouveau solde
    const [[user]] = await db.query(
      'SELECT wallet_balance FROM Users WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      newBalance: user.wallet_balance
    });
  } catch (err) {
    await db.rollback();
    console.error('Erreur dans /wallet/deposit:', err);
    res.status(500).json({ error: 'Erreur lors du dépôt' });
  }
});

// Effectuer un retrait
router.post('/withdraw', authenticateToken, async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.id;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Montant invalide' });
  }

  try {
    await db.beginTransaction();

    // Vérifier que le solde est suffisant
    const [[user]] = await db.query(
      'SELECT wallet_balance FROM Users WHERE user_id = ? FOR UPDATE',
      [userId]
    );

    if (user.wallet_balance < amount) {
      await db.rollback();
      return res.status(400).json({ error: 'Solde insuffisant' });
    }

    // Créer la transaction
    await db.query(
      'INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)',
      [userId, 'withdrawal', amount]
    );

    // Mettre à jour le solde
    await db.query(
      'UPDATE Users SET wallet_balance = wallet_balance - ? WHERE user_id = ?',
      [amount, userId]
    );

    await db.commit();

    // Récupérer le nouveau solde
    const [[updatedUser]] = await db.query(
      'SELECT wallet_balance FROM Users WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      newBalance: updatedUser.wallet_balance
    });
  } catch (err) {
    await db.rollback();
    console.error('Erreur dans /wallet/withdraw:', err);
    res.status(500).json({ error: 'Erreur lors du retrait' });
  }
});

// Payer une cotisation de tontine
router.post('/pay-contribution', authenticateToken, async (req, res) => {
  const { tontineId } = req.body;
  const userId = req.user.id;

  if (!tontineId) {
    return res.status(400).json({ error: 'ID de tontine requis' });
  }

  try {
    await db.beginTransaction();

    // Récupérer les infos de la tontine
    const [[tontine]] = await db.query(
      'SELECT contribution_amount FROM tontines WHERE tontine_id = ?',
      [tontineId]
    );

    if (!tontine) {
      await db.rollback();
      return res.status(404).json({ error: 'Tontine non trouvée' });
    }

    const amount = tontine.contribution_amount;

    // Vérifier que l'utilisateur participe à la tontine
    const [[participant]] = await db.query(
      'SELECT 1 FROM tontine_participants WHERE tontine_id = ? AND user_id = ? AND is_active = 1',
      [tontineId, userId]
    );

    if (!participant) {
      await db.rollback();
      return res.status(403).json({ error: 'Vous ne participez pas à cette tontine' });
    }

    // Vérifier que le solde est suffisant
    const [[user]] = await db.query(
      'SELECT wallet_balance FROM Users WHERE user_id = ? FOR UPDATE',
      [userId]
    );

    if (user.wallet_balance < amount) {
      await db.rollback();
      return res.status(400).json({ error: 'Solde insuffisant' });
    }

    // Créer la transaction
    await db.query(
      'INSERT INTO transactions (user_id, tontine_id, type, amount) VALUES (?, ?, ?, ?)',
      [userId, tontineId, 'contribution', amount]
    );

    // Mettre à jour le solde
    await db.query(
      'UPDATE Users SET wallet_balance = wallet_balance - ? WHERE user_id = ?',
      [amount, userId]
    );

    await db.commit();

    // Récupérer le nouveau solde
    const [[updatedUser]] = await db.query(
      'SELECT wallet_balance FROM Users WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      newBalance: updatedUser.wallet_balance,
      amountPaid: amount
    });
  } catch (err) {
    await db.rollback();
    console.error('Erreur dans /wallet/pay-contribution:', err);
    res.status(500).json({ error: 'Erreur lors du paiement' });
  }
});

module.exports = router;