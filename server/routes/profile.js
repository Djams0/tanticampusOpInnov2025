const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 10;

// Fonction utilitaire pour formater l'utilisateur
function formatUser(user) {
  return {
    id: user.user_id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phoneNumber: user.phone_number,
    dateOfBirth: user.date_of_birth ? user.date_of_birth.toISOString().split('T')[0] : null,
    university: user.university,
    studentId: user.student_id,
    isVerified: Boolean(user.is_verified),
    trustScore: user.trust_score,
    walletBalance: user.wallet_balance
  };
}

// Récupérer les informations du profil
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await db.query(
      `SELECT 
        user_id, first_name, last_name, email, phone_number, 
        date_of_birth, university, student_id, is_verified, 
        trust_score, wallet_balance
       FROM Users 
       WHERE user_id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(formatUser(users[0]));
  } catch (err) {
    console.error('Erreur dans GET /profile:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du profil' });
  }
});

// Mettre à jour les informations du profil
router.put(
  '/profile',
  authenticateToken,
  [
    body('firstName').optional().isString().trim().isLength({ min: 2 }),
    body('lastName').optional().isString().trim().isLength({ min: 2 }),
    body('phoneNumber').optional().matches(/^[0-9+\-\s]{7,15}$/).withMessage('Numéro de téléphone invalide'),
    body('dateOfBirth').optional().isISO8601().toDate(),
    body('university').optional().isString().trim(),
    body('studentId').optional().isString().trim(),
    body('password').optional().isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const {
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      university,
      studentId,
      password
    } = req.body;

    try {
      // Vérifier si l'utilisateur existe
      const [userRows] = await db.query('SELECT 1 FROM Users WHERE user_id = ?', [userId]);
      if (userRows.length === 0) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Vérifier si le nouveau studentId est déjà utilisé
      if (studentId) {
        const [existing] = await db.query(
          'SELECT 1 FROM Users WHERE student_id = ? AND user_id != ?',
          [studentId, userId]
        );
        if (existing.length > 0) {
          return res.status(400).json({ error: 'Matricule déjà utilisé' });
        }
      }

      // Préparer les champs à mettre à jour
      const updates = {};
      const fields = {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        date_of_birth: dateOfBirth,
        university: university,
        student_id: studentId
      };

      for (const [dbField, value] of Object.entries(fields)) {
        if (value !== undefined && value !== null && value !== '') {
          updates[dbField] = value;
        }
      }

      if (password) {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        updates.password_hash = hashedPassword;
      }

      if (Object.keys(updates).length > 0) {
        const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updates), userId];

        await db.query(
          `UPDATE Users SET ${setClause} WHERE user_id = ?`,
          values
        );
      }

      // Récupérer les infos mises à jour
      const [updatedUsers] = await db.query(
        `SELECT 
          user_id, first_name, last_name, email, phone_number, 
          date_of_birth, university, student_id, is_verified, 
          trust_score, wallet_balance
         FROM Users 
         WHERE user_id = ?`,
        [userId]
      );

      res.json({
        message: 'Profil mis à jour avec succès',
        user: formatUser(updatedUsers[0])
      });
    } catch (err) {
      console.error('Erreur dans PUT /profile:', err);
      res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du profil' });
    }
  }
);

module.exports = router;
