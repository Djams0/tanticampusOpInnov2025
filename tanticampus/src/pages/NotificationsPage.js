import React from 'react';
import {FaRocket, FaDatabase } from 'react-icons/fa';
import './NotificationsPage.css';

const notifications = [
  {
    type: 'rappel',
    icon: <FaDatabase />,
    title: 'Rappel',
    message: 'Pensez à régler votre cotisation pour la tontine',
    date: 'il y a 11 jours'
  },
  {
    type: 'rappel',
    icon: <FaDatabase />,
    title: 'Rappel',
    message: 'Pensez à régler votre cotisation pour la tontine',
    date: 'il y a 12 jours'
  },
  {
    type: 'ready',
    icon: <FaRocket />,
    title: 'Votre tontine est prête à démarrer',
    message: 'Voir la tontine !',
    date: 'il y a 13 jours'
  },
  {
    type: 'rappel',
    icon: <FaDatabase />,
    title: 'Rappel',
    message: 'Pensez à régler votre cotisation pour la tontine',
    date: 'il y a 13 jours'
  },
  {
    type: 'rappel',
    icon: <FaDatabase />,
    title: 'Rappel',
    message: 'Pensez à régler votre cotisation pour la tontine',
    date: 'il y a 13 jours'
  }
];

const NotificationsPage = () => {
  return (
    <div className="notifications-page">
      <header className="notifications-header">
        <h2>Notifications</h2>
        <p className="notifications-count">{notifications.length} notifications</p>
      </header>

      <section className="notifications-list">
        {notifications.map((notif, index) => (
          <div key={index} className="notification-card">
            <div className="notification-icon">{notif.icon}</div>
            <div className="notification-content">
              <strong>{notif.title}</strong>
              <p>{notif.message}</p>
            </div>
            <div className="notification-time">{notif.date}</div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default NotificationsPage;
