import React, { useEffect, useState } from 'react';
import { FaRocket, FaDatabase } from 'react-icons/fa';
import './NotificationsPage.css';

const iconMap = {
  warning: <FaDatabase />,   // mappe le type 'warning' vers l'icône correspondante
  reminder: <FaDatabase />,
  system: <FaRocket />,
  group_message: <FaRocket />,
  private_message: <FaRocket />
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Remplace l'URL par celle de ton API réelle
    fetch('/api/notifications', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token') // ou autre stockage du token
      }
    })
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          setNotifications(data.data);
        } else {
          console.error('Erreur API notifications:', data.message);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur réseau:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement des notifications...</p>;

  return (
    <div className="notifications-page">
      <header className="notifications-header">
        <h2>Notifications</h2>
        <p className="notifications-count">{notifications.length} notifications</p>
      </header>

      <section className="notifications-list">
        {notifications.map((notif) => (
          <div key={notif.notification_id} className="notification-card">
            <div className="notification-icon">
              {iconMap[notif.type] || <FaDatabase />}
            </div>
            <div className="notification-content">
              <strong>{notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}</strong>
              <p>{notif.content}</p>
            </div>
            <div className="notification-time">
              {new Date(notif.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default NotificationsPage;
