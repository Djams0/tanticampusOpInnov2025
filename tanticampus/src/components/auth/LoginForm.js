import React, { useState } from 'react';
import './LoginForm.css';
import { login } from './authService';

const LoginForm = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email requis';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.password) newErrors.password = 'Mot de passe requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await login(formData);
      onLoginSuccess(response);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        apiError: error.message || 'Email ou mot de passe incorrect'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {errors.apiError && <div className="error-message">{errors.apiError}</div>}
      
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label>Mot de passe</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
      </button>
    </form>
  );
};

export default LoginForm;