import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiBell, FiUser } from 'react-icons/fi';
import { BsWallet2 } from 'react-icons/bs';
import { IoMdAdd } from 'react-icons/io';
import './BottomNavbar.css'; // <-- ici

const BottomNavbar = ({ notificationCount = 0 }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bottom-navbar">
      <Link to="/" className={isActive('/') ? 'active' : ''}>
        <FiHome className="icon" />
        <span>Accueil</span>
      </Link>

      <Link to="/wallet" className={isActive('/wallet') ? 'active' : ''}>
        <BsWallet2 className="icon" />
        <span>Wallet</span>
      </Link>

      <Link to="/new-tontine" className="central-button">
        <IoMdAdd className="icon" />
      </Link>

      <Link to="/notifications" className={isActive('/notifications') ? 'active' : ''} style={{ position: 'relative' }}>
        <FiBell className="icon" />
        {notificationCount > 0 && (
          <span className="notification-badge">{notificationCount}</span>
        )}
        <span>Notific...</span>
      </Link>

      <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
        <FiUser className="icon" />
        <span>Comp...</span>
      </Link>
    </nav>
  );
};

export default BottomNavbar;
