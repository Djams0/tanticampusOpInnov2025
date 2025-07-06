import React, { useEffect, useState } from 'react';
import './WalletPage.css';
import DepositPopup from '../components/Wallet/DepositPopup';
import WithdrawPopup from '../components/Wallet/WithdrawPopup';
import ContributionPopup from '../components/Wallet/ContributionPopup';

const WalletPage = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showContribution, setShowContribution] = useState(false);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchWalletInfo();
    fetchTransactions();
  }, []);

  const fetchWalletInfo = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/wallet', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw await res.json();
      const data = await res.json();
      setBalance(data.balance);
    } catch (err) {
      alert('Erreur chargement solde : ' + (err.error || 'inconnue'));
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/wallet/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw await res.json();
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      alert('Erreur chargement historique : ' + (err.error || 'inconnue'));
    }
  };

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
            <div className="wallet-amount">{balance}€</div>
          </div>
          <div className="wallet-actions">
            <div className="wallet-action" onClick={() => setShowDeposit(true)}>
              <span className="action-icon green">＋</span> Recharger
            </div>
            <div className="wallet-action" onClick={() => setShowContribution(true)}>
              <span className="action-icon orange">↗</span> Cotiser
            </div>
            <div className="wallet-action" onClick={() => setShowWithdraw(true)}>
              <span className="action-icon black">⚡</span> Encaisser
            </div>
          </div>
        </div>

        <div className="wallet-history">
          <h2>Historique de mes transactions</h2>
          {transactions.map((t, i) => (
            <div className="transaction" key={i}>
              <div className="transaction-info">
                <strong>{t.type}</strong><br />
                {t.tontine_title ? `tontine «${t.tontine_title}»` : ''}
              </div>
              <div className={`transaction-amount ${t.type === 'deposit' ? 'plus' : 'minus'}`}>
                {t.type === 'deposit' || t.type === 'payout' ? '+' : '-'}{t.amount}€
              </div>
              <div className="transaction-date">{new Date(t.transaction_date).toLocaleDateString()}</div>
            </div>
          ))}
        </div>

        {showDeposit && <DepositPopup onClose={() => {
          setShowDeposit(false); fetchWalletInfo(); fetchTransactions();
        }} />}
        {showWithdraw && <WithdrawPopup onClose={() => {
          setShowWithdraw(false); fetchWalletInfo(); fetchTransactions();
        }} />}
        {showContribution && <ContributionPopup onClose={() => {
          setShowContribution(false); fetchWalletInfo(); fetchTransactions();
        }} />}
      </div>
    </div>
  );
};

export default WalletPage;
