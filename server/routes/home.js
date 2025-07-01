const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Exemple : /api/home/4
router.get('/home/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // 1. Récupérer 4 tontines actives
    const tontines = await db.query(`
      SELECT t.tontine_id, t.title, t.status, t.contribution_amount, t.frequency
      FROM tontines t
      JOIN tontineparticipants tp ON tp.tontine_id = t.tontine_id
      WHERE tp.user_id = ? AND tp.status = 'active'
      LIMIT 4
    `, [userId]);

    // 2. Prochaine contribution à payer
    const [nextContribution] = await db.query(`
      SELECT amount, due_date, status
      FROM contributions
      WHERE user_id = ? AND status = 'pending'
      ORDER BY due_date ASC
      LIMIT 1
    `, [userId]);

    // 3. Nombre de notifications non lues
    const [notifications] = await db.query(`
      SELECT COUNT(*) AS unread_count
      FROM notifications
      WHERE user_id = ? AND is_read = 0
    `, [userId]);

    // 4. Derniers posts du forum (3 max)
    const forumPosts = await db.query(`
      SELECT p.post_id, p.title, p.category, p.created_at, u.first_name, u.last_name
      FROM forumposts p
      JOIN users u ON u.user_id = p.user_id
      ORDER BY p.created_at DESC
      LIMIT 3
    `);

    // 5. Dernières sessions de mentorat programmées (3 max)
    const sessions = await db.query(`
      SELECT m.session_id, m.topic, m.scheduled_time, u.first_name AS mentor_first_name, u.last_name AS mentor_last_name
      FROM mentoringsessions m
      JOIN mentors mt ON mt.mentor_id = m.mentor_id
      JOIN users u ON u.user_id = mt.user_id
      WHERE m.mentee_id = ?
      ORDER BY m.scheduled_time DESC
      LIMIT 3
    `, [userId]);

    res.json({
      tontines,
      next_contribution: nextContribution || null,
      unread_notifications: notifications?.unread_count || 0,
      latest_forum_posts: forumPosts,
      upcoming_mentoring_sessions: sessions,
      wallet_balance: 84.00 // fictif ou à connecter à une vraie table
    });
  } catch (error) {
    console.error('Erreur dans /home:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
