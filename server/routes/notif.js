const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// --- Récupérer toutes les notifications de l'utilisateur connecté ---
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.user_id;  // supposé que authenticateToken ajoute user à req

  try {
    const [notifications] = await db.execute(
      `SELECT notification_id, tontine_id, type, content, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des notifications'
    });
  }
});

module.exports = router;
