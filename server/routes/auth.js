const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'tonticampus_secret_key_2025';
const SALT_ROUNDS = 10;

// ✅ Inscription
router.post('/register', [
  body('first_name').notEmpty(),
  body('last_name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('university').notEmpty(),
  body('student_id').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { first_name, last_name, email, password, university, student_id } = req.body;

  try {
    const [[existingEmail]] = await db.query('SELECT 1 FROM Users WHERE email = ?', [email]);
    if (existingEmail) return res.status(400).json({ error: 'Email déjà utilisé' });

    const [[existingId]] = await db.query('SELECT 1 FROM Users WHERE student_id = ?', [student_id]);
    if (existingId) return res.status(400).json({ error: 'Matricule déjà utilisé' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await db.query(`
      INSERT INTO Users (first_name, last_name, email, password_hash, university, student_id)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, hashed, university, student_id]
    );

    const token = jwt.sign({ id: result.insertId, email, first_name, last_name }, SECRET_KEY, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: result.insertId,
        first_name,
        last_name,
        email,
        university,
        student_id,
        is_verified: false,
        trust_score: 100
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ✅ Connexion
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const [users] = await db.query(`
      SELECT user_id, first_name, last_name, email, password_hash, university, student_id, is_verified, trust_score
      FROM Users WHERE email = ?`, [email]);

    if (users.length === 0) return res.status(401).json({ error: 'Identifiants incorrects' });

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Identifiants incorrects' });

    const token = jwt.sign({ id: user.user_id, email: user.email }, SECRET_KEY, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        university: user.university,
        student_id: user.student_id,
        is_verified: user.is_verified,
        trust_score: user.trust_score
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ✅ Vérification de token
const { authenticateToken } = require('../middleware/auth');
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT user_id, first_name, last_name, email, university, student_id, is_verified, trust_score
      FROM Users WHERE user_id = ?`, [req.user.id]);

    if (users.length === 0) return res.status(404).json({ isValid: false, error: 'Utilisateur non trouvé' });

    const user = users[0];
    res.json({ isValid: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ isValid: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
