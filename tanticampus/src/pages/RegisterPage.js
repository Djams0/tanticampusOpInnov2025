import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import './RegisterPage.css';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();

  const handleRegisterSuccess = (response) => {
    localStorage.setItem('authToken', response.token);
    navigate('/');
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
        <p className="login-link">
          Deja inscrit ? <a href="/login">Se connecter</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;