import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { verifyToken } from './auth/authService';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const isValid = await verifyToken();
        setIsAuthenticated(isValid);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Chargement...</div>; // Ou un spinner de chargement
  }

  if (!isAuthenticated) {
    return <Navigate to="/register" replace />;
  }

  return children;
};

export default ProtectedRoute;