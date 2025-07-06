import React, { useEffect, useState } from 'react';

const ContributionPopup = ({ onClose }) => {
  const [tontines, setTontines] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchTontines();
  }, []);

  const fetchTontines = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/wallet/contributions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw data;
      setTontines(data); // Liste des tontines à cotiser
    } catch (err) {
      setError(err.error || 'Erreur lors du chargement des cotisations');
    }
  };

  const handlePay = async () => {
    if (!selectedId) return setError("Veuillez sélectionner une cotisation.");
    try {
      const res = await fetch('http://localhost:3000/api/wallet/pay-contribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tontineId: selectedId })
      });

      const data = await res.json();
      if (!res.ok) throw data;
      onClose();
    } catch (err) {
      setError(err.error || 'Erreur lors du paiement');
    }
  };

  return (
    <div className="popup">
      <h3>Payer une cotisation</h3>
      {tontines.length === 0 && <p>Aucune cotisation à payer actuellement.</p>}
      <ul>
        {tontines.map((t) => (
          <li key={t.id}>
            <label>
              <input
                type="radio"
                name="tontine"
                value={t.id}
                onChange={() => setSelectedId(t.id)}
              />
              {t.nom} — Montant : {t.montant}€ — Échéance : {new Date(t.echeance).toLocaleDateString()}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={handlePay}>Payer</button>
      <button onClick={onClose}>Annuler</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default ContributionPopup;
