const express = require('express');
const cors = require('cors'); // Ajoutez cette ligne
const authRoutes = require('./authentication');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors()); // CORS doit être configuré une seule fois au niveau de l'application

// Routes
app.use('/api/auth', authRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur TontiCampus démarré sur le port ${PORT}`);
});