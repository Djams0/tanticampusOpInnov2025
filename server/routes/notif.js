app.get('/notifications', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        notification_id,
        user_id,
        tontine_id,
        type,
        content,
        is_read,
        created_at
      FROM notifications
      ORDER BY created_at DESC
    `);
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des notifications.'
    });
  }
});