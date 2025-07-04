const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Endpoint pour récupérer les informations du tableau de bord http://localhost:3000/api
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Récupérer le prénom et le solde de l'utilisateur
    const [[user]] = await db.query(
      'SELECT first_name, wallet_balance FROM Users WHERE user_id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // 2. Récupérer le nombre de tontines où l'utilisateur doit régler un versement
    const [[pendingPayments]] = await db.query(
      `SELECT COUNT(DISTINCT t.tontine_id) as count
       FROM tontines t
       JOIN tontine_participants tp ON t.tontine_id = tp.tontine_id
       LEFT JOIN transactions tr ON t.tontine_id = tr.tontine_id AND tr.user_id = ?
       WHERE tp.user_id = ? 
       AND t.status = 'active'
       AND (tr.transaction_id IS NULL OR tr.type != 'contribution')
       AND tp.is_active = 1`,
      [userId, userId]
    );

    // 3. Récupérer les tontines auxquelles l'utilisateur participe (4 max)
    const [participatingTontines] = await db.query(
      `SELECT t.tontine_id, t.title, t.description, t.contribution_amount, t.frequency
       FROM tontines t
       JOIN tontine_participants tp ON t.tontine_id = tp.tontine_id
       WHERE tp.user_id = ? AND tp.is_active = 1
       ORDER BY t.start_date DESC
       LIMIT 4`,
      [userId]
    );

    // Formater la réponse
    const response = {
      firstName: user.first_name,
      walletBalance: user.wallet_balance,
      pendingPaymentsCount: pendingPayments.count,
      participatingTontines: participatingTontines.map(tontine => ({
        id: tontine.tontine_id,
        title: tontine.title,
        description: tontine.description,
        amount: tontine.contribution_amount,
        frequency: tontine.frequency
      }))
    };

    res.json(response);
  } catch (err) {
    console.error('Erreur dans /home:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des données' });
  }
});

module.exports = router;