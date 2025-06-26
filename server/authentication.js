const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || 'tonticampus_secret_key_2025';
const SALT_ROUNDS = 10;

// Configurer la connexion MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tanticampus25',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware pour authentification avec JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Token d\'authentification requis' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token invalide ou expiré' });
        req.user = user;
        next();
    });
};

// Inscription utilisateur
router.post('/register', [
    body('first_name').notEmpty().withMessage('Le prénom est requis'),
    body('last_name').notEmpty().withMessage('Le nom est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('university').notEmpty().withMessage('L\'université est requise'),
    body('student_id').notEmpty().withMessage('L\'identifiant étudiant est requis')
], async (req, res) => {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, email, password, university, student_id } = req.body;

    try {
        // Vérifier si l'email existe déjà
        const [emailCheck] = await db.query('SELECT email FROM Users WHERE email = ?', [email]);
        if (emailCheck.length > 0) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        // Vérifier si l'identifiant étudiant existe déjà
        const [studentIdCheck] = await db.query('SELECT student_id FROM Users WHERE student_id = ?', [student_id]);
        if (studentIdCheck.length > 0) {
            return res.status(400).json({ error: 'Cet identifiant étudiant est déjà utilisé' });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Créer l'utilisateur dans la base de données
        const [result] = await db.query(
            'INSERT INTO Users (first_name, last_name, email, password_hash, university, student_id) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, hashedPassword, university, student_id]
        );

        const userId = result.insertId;

        // Création du token JWT
        const token = jwt.sign(
            { 
                id: userId, 
                email: email,
                first_name: first_name,
                last_name: last_name
            }, 
            SECRET_KEY, 
            { expiresIn: '7d' }
        );

        // Réponse avec le token et les informations utilisateur
        res.status(201).json({
            token,
            user: {
                id: userId,
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
        console.error('Erreur lors de l\'inscription:', err);
        res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
    }
});

// Connexion utilisateur
router.post('/login', [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Le mot de passe est requis')
], async (req, res) => {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Rechercher l'utilisateur par email
        const [users] = await db.query(
            'SELECT user_id, first_name, last_name, email, password_hash, university, student_id, is_verified, trust_score FROM Users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const user = users[0];

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        // Création du token JWT
        const token = jwt.sign(
            { 
                id: user.user_id, 
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            }, 
            SECRET_KEY, 
            { expiresIn: '7d' }
        );

        // Réponse avec le token et les informations utilisateur (sans le mot de passe)
        const userResponse = {
            id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            university: user.university,
            student_id: user.student_id,
            is_verified: user.is_verified,
            trust_score: user.trust_score
        };

        res.json({ token, user: userResponse });

    } catch (err) {
        console.error('Erreur lors de la connexion:', err);
        res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
    }
});

// Vérification du token (pour le frontend)
router.get('/verify', authenticateToken, async (req, res) => {
    try {
        // Si le middleware authenticateToken a passé, le token est valide
        // On peut maintenant récupérer les informations de l'utilisateur
        const userId = req.user.id;
        
        // Requête pour obtenir les informations de l'utilisateur
        const [users] = await db.query(
            'SELECT user_id, first_name, last_name, email, university, student_id, is_verified, trust_score FROM Users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                isValid: false,
                error: 'Utilisateur non trouvé' 
            });
        }

        const user = users[0];
        
        // Réponse avec les informations de l'utilisateur
        res.json({
            isValid: true,
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
        console.error('Erreur lors de la vérification du token:', err);
        res.status(500).json({ 
            isValid: false,
            error: 'Erreur serveur lors de la vérification du token' 
        });
    }
});

module.exports = router;