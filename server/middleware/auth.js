const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'tonticampus_secret_key_2025';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔐 Auth Middleware - Token reçu :', token);

  if (!token) return res.status(401).json({ error: 'Token requis' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.error('❌ Token invalide :', err.message);
      return res.status(403).json({ error: 'Token invalide' });
    }

    console.log('✅ Token valide - Utilisateur :', user);
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
