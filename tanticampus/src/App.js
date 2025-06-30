import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import WalletPage from './pages/WalletPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import NewTontinePage from './pages/NewTontinePage';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNavbar from './components/BottomNavbar'; // <-- Ajouté
import './App.css';

import { useEffect, useState } from 'react';

function AppContent() {
  const location = useLocation();
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    // Affiche la navbar sauf sur login/register
    const hiddenRoutes = ['/login', '/register'];
    setShowNavbar(!hiddenRoutes.includes(location.pathname));
  }, [location]);

  return (
    <>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wallet" 
          element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-tontine"
          element={
            <ProtectedRoute>
              <NewTontinePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showNavbar && <BottomNavbar notificationCount={1} />}
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="App pb-20"> {/* padding bas pour éviter que la navbar ne cache le contenu */}
        <AppContent />
      </div>
    </Router>
  );
}

export default App;
