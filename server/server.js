const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const tontineRoutes = require('./routes/tontine');

const app = express();

// Middleware globaux
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', homeRoutes);
app.use('/api/tontine', tontineRoutes);

// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur TontiCampus lancé sur le port ${PORT}`);
});
