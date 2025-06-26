import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (response) => {
    localStorage.setItem('authToken', response.token);
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Connexion</h2>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
        <p className="register-link">
          Pas encore de compte ? <a href="/register">S'inscrire</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;