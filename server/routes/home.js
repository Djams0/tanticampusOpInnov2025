const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Endpoint : /api/dashboard/:userId
router.get('/dashboard/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // 1. Récupérer les infos de base de l'utilisateur (prénom et solde)
    const [userInfo] = await db.query(`
      SELECT first_name, wallet_balance 
      FROM users 
      WHERE user_id = ?
    `, [userId]);

    if (!userInfo) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // 2. Récupérer les tontines actives (4 max)
    const tontines = await db.query(`
      SELECT t.tontine_id, t.title, t.status, t.contribution_amount, t.frequency
      FROM tontines t
      JOIN tontine_participants tp ON tp.tontine_id = t.tontine_id
      WHERE tp.user_id = ? AND tp.is_active = 1 AND t.status = 'active'
      LIMIT 4
    `, [userId]);

    // 3. Compter le nombre de tontines où l'utilisateur doit faire un versement
    // (On considère qu'il doit payer si la tontine est active et qu'il est participant actif)
    const [pendingContributions] = await db.query(`
      SELECT COUNT(DISTINCT t.tontine_id) AS pending_count
      FROM tontines t
      JOIN tontine_participants tp ON tp.tontine_id = t.tontine_id
      WHERE tp.user_id = ? AND tp.is_active = 1 AND t.status = 'active'
    `, [userId]);

    res.json({
      user: {
        first_name: userInfo.first_name,
        wallet_balance: userInfo.wallet_balance
      },
      active_tontines: tontines,
      pending_payments_count: pendingContributions.pending_count || 0
    });
  } catch (error) {
    console.error('Erreur dans /dashboard:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;