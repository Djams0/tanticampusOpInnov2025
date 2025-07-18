# TontiCampus

## 🚀 Présentation

**TontiCampus** est une application web qui permet aux étudiants de financer leurs projets professionnels grâce à un système de **tontine numérique**. La plateforme vise à structurer et sécuriser la gestion de tontines étudiantes dans un cadre collaboratif et transparent.

---

## 🧱 Stack technique recommandée

### Frontend

* **React.js** (ou **Next.js** pour un rendu côté serveur)
* **Tailwind CSS** (pour un design moderne et rapide à intégrer)
* **TypeScript** (fortement recommandé pour la robustesse du code)

### Backend

* **Node.js** avec **Express.js** (léger, rapide à mettre en place)
* **JWT** pour la gestion de l'authentification

### Base de données

* **MySQL** via **phpMyAdmin**
* Hébergée en local ou sur un serveur distant (XAMPP, WAMP, etc.)

---

## 📁 Structure du projet

```
OpenInnov/
│
├── tanticampus(frontend)/           # App React (ou Next.js)
│   ├── pages/
│   ├── components/
│   └── ...
│
├── server/            # API Express.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── ...
│
└── README.md
```

---

## ⚙️ Installation

### Prérequis

* Node.js ≥ 18
* MySQL ≥ 8
* phpMyAdmin (via XAMPP, WAMP, etc.)

### Étapes

1. **Cloner le projet**

```bash
git clone https://github.com/username/tonticampus.git
cd tonticampus
```

2. **Configurer `.env`**
   Dans `/backend` :

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=ton_mot_de_passe
DB_NAME=tonticampus_db
JWT_SECRET=tonsecret
```

3. **Créer la base de données**
   Dans **phpMyAdmin**, crée une base appelée `tanticampus25`.

Tu peux aussi exécuter un script SQL pour créer les tables (on peut le générer si tu veux).

4. **Installer les dépendances**

```bash
cd frontend && npm install
cd ../backend && npm install
```

5. **Lancer l'application**

```bash
# Lancer le backend
cd server
node api.js

# Lancer le frontend
cd tanticampus
npm start
```

---

## 🧩 Fonctionnalités essentielles

### 🔐 Authentification

* Inscription / Connexion avec email + mot de passe
* Profil utilisateur (nom, email, statut étudiant)
* Token JWT pour sécuriser les routes

### 👥 Gestion des tontines

* Création de tontines (montant, fréquence, règles)
* Ajout / validation de membres
* Vue d'ensemble d'une tontine (participants, statut)
* Historique de participation

### 📊 Tableau de bord

* Liste des tontines en cours / passées
* Statut des contributions
* Notifications des échéances

### 💬 Espace communautaire

* Forum simplifié (catégories, messages)
* Section mentorat (profils d’accompagnants)

---

## 🔧 Fonctionnalités à venir

* Automatisation des paiements
* Gestion des litiges
* Application mobile
* Notifications en temps réel