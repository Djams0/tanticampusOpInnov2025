// pages/HomePage.jsx
import React from 'react';
import './HomePage.css';
import { Link, useLocation } from 'react-router-dom';

const HomePage = () => {
  // Données factices
  const tontines = ['Amis'];
  const walletBalance = 84;
  const nextContribution = null;
  const today = new Date();
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  const formattedDate = today.toLocaleDateString('fr-FR', options);


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
              {[...Array(3)].map((_, i) => (
                <Link to="/new-tontine" className="details-link_new"><div key={i} className="tontine-empty">+</div></Link>
              ))}
            </div>
            <p className="import-link">+ Importer une tontine</p>
          </div>
        </div>
        <div className="header-right">
          <img src="/profile.png" alt="profil" className="profile-img" />
          <Link to="/Profile" className="details-link">Mon profile</Link>
        </div>
      </div>

      <div className="overview">
        <p className="date">{formattedDate}</p>
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
            <Link to="/Wallet" className="details-link">Voir les détails</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
