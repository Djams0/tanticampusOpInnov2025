import React, { useState } from 'react';
import './RegisterForm.css';
import { register } from './authService';

const RegisterForm = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    university: '',
    student_id: ''
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
    if (!formData.first_name) newErrors.first_name = 'Le prénom est requis';
    if (!formData.last_name) newErrors.last_name = 'Le nom est requis';
    if (!formData.email) newErrors.email = 'Email requis';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.password) newErrors.password = 'Mot de passe requis';
    else if (formData.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    if (!formData.university) newErrors.university = 'Université requise';
    if (!formData.student_id) newErrors.student_id = 'Identifiant étudiant requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await register(formData);
      onRegisterSuccess(response);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        apiError: error.message || 'Une erreur est survenue lors de l\'inscription'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <h2>Inscription</h2>
      
      {errors.apiError && <div className="error-message">{errors.apiError}</div>}
      
      <div className="form-group">
        <label>Prénom</label>
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
        />
        {errors.first_name && <span className="error">{errors.first_name}</span>}
      </div>

      <div className="form-group">
        <label>Nom</label>
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
        />
        {errors.last_name && <span className="error">{errors.last_name}</span>}
      </div>

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

      <div className="form-group">
        <label>Université</label>
        <select
          name="university"
          value={formData.university}
          onChange={handleChange}
        >
            <option value="">Sélectionnez votre université</option>
            <option value="EPSI-Paris">EPSI Paris</option>
            <option value="Université-Paris">Université Paris</option>
            <option value="Saint-Denis-Université">Daint-Denis Université</option>
            <option value="Paris-Sorbonne">Paris-Sorbonne</option>
            <option value="Paris-Dauphine">Paris-Dauphine</option>
        </select>
        {errors.university && <span className="error">{errors.university}</span>}
      </div>

      <div className="form-group">
        <label>Identifiant étudiant</label>
        <input
          type="text"
          name="student_id"
          value={formData.student_id}
          onChange={handleChange}
        />
        {errors.student_id && <span className="error">{errors.student_id}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
      </button>
    </form>
  );
};

export default RegisterForm;