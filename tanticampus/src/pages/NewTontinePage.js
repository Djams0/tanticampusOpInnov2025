// pages/NewTontinePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewTontinePage.css';

const CreateTontinePage = () => {
  const [tontineName, setTontineName] = useState('');
  const [day, setDay] = useState('10');
  const [month, setMonth] = useState('janvier');
  const [year, setYear] = useState('2025');
  const [frequency, setFrequency] = useState('mensuelle');
  const [duration, setDuration] = useState('');
  const [amount, setAmount] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken');
    if (!token) {
      setErrorMessage("Token d'authentification non trouvé.");
      return;
    }

    const payload = {
      tontineName,
      firstPayment: `${day}-${month}-${year}`,
      frequency,
      duration: parseInt(duration),
      amount: parseFloat(amount),
    };

    try {
      const response = await fetch('http://localhost:3000/api/tontine/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.errors) {
          // Erreurs de validation
          const messages = data.errors.map(err => `• ${err.msg} (${err.param})`).join('\n');
          setErrorMessage(`Erreur 400 - Données invalides :\n${messages}`);
        } else if (data.error) {
          // Autre message d'erreur
          setErrorMessage(`Erreur ${response.status} - ${data.error}`);
        } else {
          setErrorMessage(`Erreur ${response.status} - Une erreur inconnue est survenue.`);
        }
      } else {
        // Succès
        setSuccessMessage(` ${data.message}`);
        setTimeout(() => {
          navigate('/tontine');
        }, 5000); // Redirection après 5 secondes
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Erreur de connexion au serveur. Veuillez réessayer plus tard.');
    }
  };

  return (
    <div className="tontine-container">
      <div className="tontine-header-bar" />
      <div className="tontine-form-wrapper">
        <h1>Création de la tontine</h1>

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <form className="tontine-form" onSubmit={handleSubmit}>
          <label>Nom de la tontine</label>
          <input
            type="text"
            placeholder="Nom de la tontine"
            value={tontineName}
            onChange={(e) => setTontineName(e.target.value)}
            required
          />

          <label>Entrez la date du premier versement</label>
          <div className="date-selectors">
            <select value={day} onChange={(e) => setDay(e.target.value)}>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              {[
                'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
              ].map((m, i) => (
                <option key={i}>{m}</option>
              ))}
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              {[2024, 2025, 2026].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>

          <p className="info-text">
            Le <span className="highlight">{day}</span> de chaque période, à partir de <span className="highlight">{month}</span>, un membre recevra la cagnotte.
          </p>

          <label>Choisissez la fréquence de la tontine</label>
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
            <option value="hebdomadaire">Chaque semaine</option>
            <option value="quinzaine">Tous les 15 jours</option>
            <option value="mensuelle">Chaque mois</option>
          </select>

          <label>
            Choisissez la durée de la tontine
            <span className="note">
              {frequency === 'hebdomadaire'
                ? ' 1 semaine = 1 membre'
                : frequency === 'quinzaine'
                ? ' 15 jours = 1 membre'
                : ' 1 mois = 1 membre'}
            </span>
          </label>
          <select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="">Sélectionnez</option>
            {[...Array(20)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1} périodes</option>
            ))}
          </select>

          <label>Montant de la cotisation</label>
          <input
            type="number"
            placeholder="Entrez le montant ici"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            required
          />

          <button type="submit">Étape suivante</button>
        </form>
      </div>
    </div>
  );
};

export default CreateTontinePage;
