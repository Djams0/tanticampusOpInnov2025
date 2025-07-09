const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// --- Faire une demande pour rejoindre une tontine via son code ---
router.post('/join', authenticateToken, async (req, res) => {
  const { tontine_code } = req.body;
  const userId = req.user.id;

  if (!tontine_code) {
    return res.status(400).json({ message: 'Code manquant dans la requête.' });
  }

  if (tontine_code.length !== 10) {
    return res.status(400).json({ message: `Code invalide : attendu 10 caractères, reçu ${tontine_code.length}.` });
  }

  if (!/[a-zA-Z]/.test(tontine_code)) {
    return res.status(400).json({ message: 'Code invalide : doit contenir au moins une lettre.' });
  }

  try {
    const [tontines] = await db.execute('SELECT * FROM tontines WHERE tontine_code = ?', [tontine_code]);
    if (tontines.length === 0) {
      return res.status(404).json({ message: 'Tontine introuvable.' });
    }

    const tontine = tontines[0];

    // Vérifier si la tontine est complète
    const [participants] = await db.execute(
      'SELECT COUNT(*) AS count FROM tontine_participants WHERE tontine_id = ?',
      [tontine.tontine_id]
    );
    if (participants[0].count >= tontine.max_participants) {
      return res.status(403).json({ message: 'La tontine est déjà complète.' });
    }

    // Vérifier si l'utilisateur a déjà fait une demande en attente
    const [existingRequests] = await db.execute(
      'SELECT * FROM join_requests WHERE tontine_id = ? AND user_id = ? AND status = "pending"',
      [tontine.tontine_id, userId]
    );

    if (existingRequests.length > 0) {
      return res.status(409).json({ message: 'Une demande est déjà en attente.' });
    }

    // Créer une nouvelle demande
    await db.execute(
      'INSERT INTO join_requests (tontine_id, user_id, status) VALUES (?, ?, "pending")',
      [tontine.tontine_id, userId]
    );

    return res.status(200).json({ message: "Demande envoyée avec succès. En attente de validation par l'admin." });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
