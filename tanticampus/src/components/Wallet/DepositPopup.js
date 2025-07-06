import React, { useState } from 'react';

const DepositPopup = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('authToken');

  const handleDeposit = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: parseFloat(amount) })
      });

      const data = await res.json();
      if (!res.ok) throw data;
      onClose();
    } catch (err) {
      setError(err.error || 'Erreur inconnue');
    }
  };

  return (
    <div className="popup">
      <h3>Déposer de l'argent</h3>
      <input
        type="number"
        placeholder="Montant en €"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <button onClick={handleDeposit}>Valider</button>
      <button onClick={onClose}>Annuler</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default DepositPopup;
