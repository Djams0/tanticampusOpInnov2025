const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Fonction pour générer un code de tontine aléatoire (8 chiffres + 2 lettres)
const generateTontineCode = () => {
  const numbers = '0123456789';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';

  // 8 chiffres
  for (let i = 0; i < 8; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  // 2 lettres
  for (let i = 0; i < 2; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  return code;
};

// Convertir la fréquence du français vers la valeur de la BDD
const translateFrequency = (freq) => {
  switch (freq) {
    case 'hebdomadaire': return 'weekly';
    case 'quinzaine': return 'biweekly';
    case 'mensuelle': return 'monthly';
    default: return 'monthly';
  }
};

// Endpoint pour créer une nouvelle tontine
router.post('/create', authenticateToken, [
  body('tontineName').notEmpty().withMessage('Le nom de la tontine est requis'),
  body('firstPayment').notEmpty().withMessage('La date du premier versement est requise'),
  body('frequency').isIn(['hebdomadaire', 'quinzaine', 'mensuelle']).withMessage('Fréquence invalide'),
  body('duration').isInt({ min: 1, max: 20 }).withMessage('La durée doit être entre 1 et 20 périodes'),
  body('amount').isFloat({ min: 1 }).withMessage('Le montant doit être un nombre positif')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.id;
  const { tontineName, firstPayment, frequency, duration, amount } = req.body;

  try {
    // Vérifier que l'utilisateur n'a pas déjà 4 tontines actives
    const [userTontines] = await db.query(
      `SELECT COUNT(*) as count 
       FROM tontine_participants 
       WHERE user_id = ? AND is_active = 1`,
      [userId]
    );

    if (userTontines[0].count >= 4) {
      return res.status(400).json({ error: 'Vous participez déjà à 4 tontines actives' });
    }

    // Vérifier que l'utilisateur n'a pas déjà créé 4 tontines
    const [createdTontines] = await db.query(
      `SELECT COUNT(*) as count 
       FROM tontines 
       WHERE admin_id = ?`,
      [userId]
    );

    if (createdTontines[0].count >= 4) {
      return res.status(400).json({ error: 'Vous avez déjà créé 4 tontines' });
    }

    // Convertir la date du premier versement (format: "10-janvier-2025")
    const [day, monthFr, year] = firstPayment.split('-');
    const months = {
      'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
      'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
      'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12'
    };
    const startDate = `${year}-${months[monthFr]}-${day.padStart(2, '0')}`;

    // Générer un code unique pour la tontine
    let tontineCode;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      tontineCode = generateTontineCode();
      const [[existingCode]] = await db.query(
        'SELECT 1 FROM tontines WHERE tontine_code = ?',
        [tontineCode]
      );
      if (!existingCode) isUnique = true;
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Erreur lors de la génération du code tontine' });
    }

    // Créer la tontine dans la base de données
    const [result] = await db.query(
      `INSERT INTO tontines 
       (admin_id, tontine_code, title, frequency, contribution_amount, max_participants, start_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, tontineCode, tontineName, translateFrequency(frequency), amount, duration, startDate]
    );

    // Ajouter l'admin comme participant
    await db.query(
      `INSERT INTO tontine_participants 
       (tontine_id, user_id, role, is_active)
       VALUES (?, ?, 'admin', 1)`,
      [result.insertId, userId]
    );

    res.status(201).json({
      message: 'Tontine créée avec succès',
      tontineId: result.insertId,
      tontineCode,
      nextStep: '/tontine/invite/' + result.insertId
    });

  } catch (err) {
    console.error('Erreur lors de la création de la tontine:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la création de la tontine' });
  }
});

module.exports = router;