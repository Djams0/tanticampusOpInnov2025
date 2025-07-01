// pages/HomePage.jsx
import React from 'react';
import './HomePage.css';

const HomePage = () => {
  // Données factices
  const tontines = ['Amis'];
  const walletBalance = 84;
  const nextContribution = null; // ou { amount: 25, due_date: "2024-12-05" }

  return (
    <div className="home-container">
      <div className="header-card">
        <div className="header-left">
          <p>Bonjour, <span className="bold-name">Kouadio</span></p>
          <div className="tontines-section">
            <p className="section-title">Mes tontines ({tontines.length})</p>
            <div className="tontines-list">
              {tontines.map((t, i) => (
                <div key={i} className="tontine-item">{t}</div>
              ))}
              {[...Array(2)].map((_, i) => (
                <div key={i} className="tontine-empty">+</div>
              ))}
            </div>
            <p className="import-link">+ Importer une tontine</p>
          </div>
        </div>
        <div className="header-right">
          <img src="/profile.png" alt="profil" className="profile-img" />
          <p className="view-profile">Voir mon profil</p>
        </div>
      </div>

      <div className="overview">
        <p className="date">03 déc. 2024</p>
        <div className="overview-boxes">
          <div className="box orange">
            <p className="box-title">Verser ma prochaine cotisation</p>
            <p className="box-subtitle">
              {nextContribution
                ? `Montant : ${nextContribution.amount}€ – Échéance : ${nextContribution.due_date}`
                : "Actuellement, il n'y a aucune contribution à payer"}
            </p>
            <span className="details-link">Voir les détails</span>
          </div>
          <div className="box dark">
            <p className="box-title">Mon Wallet</p>
            <p className="wallet-amount">{walletBalance}€</p>
            <span className="details-link">Voir les détails</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
