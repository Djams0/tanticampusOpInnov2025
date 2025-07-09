import React, { useEffect, useState } from 'react';
import './HomePage.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    walletBalance: 0,
    pendingPaymentsCount: 0,
    participatingTontines: [],
    profileImageUrl: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [showImportModal, setShowImportModal] = useState(false);
  const [tontineCode, setTontineCode] = useState('');
  const [importStatus, setImportStatus] = useState('');

  const today = new Date();
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  const formattedDate = today.toLocaleDateString('fr-FR', options);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError("Token d'authentification manquant.");
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:3000/api', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;

        setUserData({
          firstName: data.firstName || '',
          walletBalance: parseFloat(data.walletBalance) || 0,
          pendingPaymentsCount: data.pendingPaymentsCount || 0,
          participatingTontines: Array.isArray(data.participatingTontines) ? data.participatingTontines : [],
          profileImageUrl: data.profileImageUrl || ''
        });
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleImportTontine = async () => {
    if (tontineCode.length !== 10) {
      setImportStatus("❌ Le code doit contenir exactement 10 caractères.");
      return;
    }
    if (!/[a-zA-Z]/.test(tontineCode)) {
      setImportStatus("❌ Le code doit contenir au moins une lettre.");
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setImportStatus("Token manquant.");
        return;
      }

      const response = await axios.post('http://localhost:3000/api/import-tontine/join', {
        tontine_code: tontineCode
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setImportStatus('✅ Demande envoyée avec succès !');
      setTontineCode('');
      setTimeout(() => {
        setShowImportModal(false);
        setImportStatus('');
      }, 2000);
    } catch (err) {
      console.error(err);
      setImportStatus(err.response?.data?.message || "❌ Erreur lors de l'importation.");
    }
  };

  const { firstName, walletBalance, participatingTontines, pendingPaymentsCount } = userData;

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="home-container">
      {error && <p className="error-message">{error}</p>}

      <div className="header-card">
        <div className="header-left">
          <p>Bonjour, <span className="bold-name">{firstName || 'Utilisateur'}</span></p>

          <div className="tontines-section">
            <p className="section-title">Mes tontines ({participatingTontines.length})</p>
            <div className="tontines-list">
              {participatingTontines.map((t) => (
                <Link to={`/tontine/${t.id}`} key={t.id} className="tontine-item" title={t.title}>
                  {t.title}
                </Link>
              ))}

              {[...Array(Math.max(0, 4 - participatingTontines.length))].map((_, i) => (
                <Link to="/new-tontine" className="details-link_new" key={i}>
                  <div className="tontine-empty">+</div>
                </Link>
              ))}
            </div>

            <span className="details-link" onClick={() => setShowImportModal(true)}>
              Importer une tontine
            </span>
          </div>
        </div>

        <div className="header-right">
          {userData.profileImageUrl ? (
            <img
              src={userData.profileImageUrl}
              alt="profil"
              className="profile-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-profile.png";
              }}
            />
          ) : (
            <div className="profile-icon-fallback">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#ccc" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" />
                <path d="M12 14c-5 0-8 2.5-8 4v2h16v-2c0-1.5-3-4-8-4z" />
              </svg>
            </div>
          )}
          <Link to="/Profile" className="details-link">Mon profil</Link>
        </div>
      </div>

      <div className="overview">
        <p className="date">{formattedDate}</p>
        <div className="overview-boxes">
          <div className="box orange">
            <p className="box-title">Mes cotisations en attente</p>
            <p className="box-subtitle">
              {pendingPaymentsCount > 0
                ? `${pendingPaymentsCount} cotisation(s) à verser`
                : "Aucune cotisation en attente"}
            </p>
          </div>
          <div className="box dark">
            <p className="box-title">Mon Wallet</p>
            <p className="wallet-amount">{walletBalance.toFixed(2)}€</p>
            <Link to="/Wallet" className="details-link">Voir les détails</Link>
          </div>
        </div>
      </div>

      {/* Modal Import Tontine */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Importer une tontine</h3>
            <input
              type="text"
              placeholder="Code de la tontine (10 caractères)"
              value={tontineCode}
              onChange={(e) => setTontineCode(e.target.value.toUpperCase())} // Forcer majuscules par exemple
              maxLength={10}
            />
            <button onClick={handleImportTontine}>Envoyer la demande</button>
            {importStatus && <p className="status-message">{importStatus}</p>}
            <button className="close-btn" onClick={() => {
              setShowImportModal(false);
              setImportStatus('');
              setTontineCode('');
            }}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
