import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/register');
  };

  return (
    <div className="home-page">
      <h1>Bienvenue sur TantiCampus</h1>
      <div className="auth-options">
        <button onClick={handleLogout} className="auth-button">
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default HomePage;