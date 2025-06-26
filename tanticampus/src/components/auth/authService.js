const API_URL = 'http://localhost:3000';

export const register = async (userData) => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    let errorMessage = 'Erreur lors de l\'inscription';
    if (data.error) errorMessage = data.error;
    if (data.errors) errorMessage = data.errors.map(err => err.msg).join(', ');
    throw new Error(errorMessage);
  }

  return data;
};

export const login = async (credentials) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    let errorMessage = 'Email ou mot de passe incorrect';
    if (data.error) errorMessage = data.error;
    throw new Error(errorMessage);
  }

  return data;
};

export const verifyToken = async () => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;

  try {
    const response = await fetch(`${API_URL}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};