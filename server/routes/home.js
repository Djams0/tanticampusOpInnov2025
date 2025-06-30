const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/home-overview/:userId', async (req, res) => {
  const userId = req.params.userId;

  // 1. Récupérer les 4 tontines max actives
  const tontines = await db.query(`
    SELECT t.tontine_id, t.title, t.status, t.contribution_amount
    FROM tontines t
    JOIN tontineparticipants p ON p.tontine_id = t.tontine_id
    WHERE p.user_id = ? AND p.status = 'active'
    LIMIT 4
  `, [userId]);

  // 2. Prochaine contribution à payer
  const nextContribution = await db.query(`
    SELECT amount, due_date, status
    FROM contributions
    WHERE user_id = ? AND status = 'pending'
    ORDER BY due_date ASC
    LIMIT 1
  `, [userId]);

  // 3. Solde Wallet fictif (à remplacer si tu as une table wallet)
  const walletBalance = 84.00;

  // 4. Nombre de notifications non lues
  const notifications = await db.query(`
    SELECT COUNT(*) AS unread_count
    FROM notifications
    WHERE user_id = ? AND is_read = 0
  `, [userId]);

  res.json({
    tontines,
    next_contribution: nextContribution[0] || null,
    wallet_balance: walletBalance,
    notifications: notifications[0]?.unread_count || 0
  });
});


router.post('/tontine/join', async (req, res) => {
  const { userId, tontineId } = req.body;

  const [count] = await db.query(`
    SELECT COUNT(*) AS active_count
    FROM tontineparticipants
    WHERE user_id = ? AND status = 'active'
  `, [userId]);

  if (count.active_count >= 4) {
    return res.status(400).json({ error: "Vous participez déjà à 4 tontines actives." });
  }

  await db.query(`
    INSERT INTO tontineparticipants (user_id, tontine_id, status, is_approved)
    VALUES (?, ?, 'pending', 0)
  `, [userId, tontineId]);

  res.json({ success: true });
});


module.exports = router;
