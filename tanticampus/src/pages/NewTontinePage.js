import React, { useState } from 'react';
import './NewTontinePage.css';

const CreateTontinePage = () => {
  const [tontineName, setTontineName] = useState('');
  const [day, setDay] = useState('10');
  const [month, setMonth] = useState('janvier');
  const [year, setYear] = useState('2025');
  const [frequency, setFrequency] = useState('mensuelle');
  const [duration, setDuration] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      tontineName,
      firstPayment: `${day}-${month}-${year}`,
      frequency,
      duration,
      amount
    });
  };

  return (
    <div className="tontine-container">
      <div className="tontine-header-bar" />
      <div className="tontine-form-wrapper">
        <h1>Création de la tontine</h1>
        <form className="tontine-form" onSubmit={handleSubmit}>
          <label>Nom de la tontine</label>
          <input
            type="text"
            placeholder="Nom de la tontine"
            value={tontineName}
            onChange={(e) => setTontineName(e.target.value)}
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

          <label>Choisissez le montant de la cotisation {frequency === 'mensuelle' ? 'mensuelle' : frequency === 'hebdomadaire' ? 'hebdomadaire' : 'bimensuelle'}</label>
          <input
            type="number"
            placeholder="Entrez le montant ici"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button type="submit">Étape suivante</button>
        </form>
      </div>
    </div>
  );
};

export default CreateTontinePage;
