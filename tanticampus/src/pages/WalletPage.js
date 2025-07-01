import React from 'react';
import './WalletPage.css';

const WalletPage = () => {
  return (
    <div className="wallet-container">
      <div className="wallet-header-bar" />
      <div className="wallet-content">
        <h1 className="wallet-title">Mon Wallet</h1>
        <p className="wallet-subtitle">
          Rechargez votre compte, versez vos cotisations<br />
          et encaissez votre argent
        </p>

        <div className="wallet-card">
          <div className="wallet-balance">
            <div className="wallet-balance-label">Solde</div>
            <div className="wallet-amount">84€</div>
          </div>
          <div className="wallet-actions">
            <div className="wallet-action">
              <span className="action-icon green">＋</span>
              Recharger
            </div>
            <div className="wallet-action">
              <span className="action-icon orange">↗</span>
              Cotiser
            </div>
            <div className="wallet-action">
              <span className="action-icon black">⚡</span>
              Encaisser
            </div>
          </div>
        </div>

        <div className="wallet-history">
          <h2>Historique de mes transactions</h2>

          <div className="transaction">
            <div className="transaction-info">
              <strong>Versement</strong><br />
              tontine «Amis»
            </div>
            <div className="transaction-amount minus">–30€</div>
            <div className="transaction-date">06/12/24</div>
          </div>

          <div className="transaction">
            <div className="transaction-info">
              <strong>Rechargement</strong><br />
              par virement
            </div>
            <div className="transaction-amount plus">+80€</div>
            <div className="transaction-date">29/11/24</div>
          </div>

          <div className="transaction">
            <div className="transaction-info">
              <strong>Rechargement</strong>
            </div>
            <div className="transaction-amount plus">+200€</div>
            <div className="transaction-date">22/11/24</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
