import React, { useState } from 'react';
import './TontinePage.css';

const members = [
  { initials: 'AD', name: 'Amina Diallo', status: 'Payé' },
  { initials: 'MT', name: 'Moussa Traoré', status: 'Payé' },
  { initials: 'FS', name: 'Fatou Sow', status: 'Bénéficiaire' },
  { initials: 'IC', name: 'Ibrahim Coulibaly', status: 'En attente' },
  { initials: 'MK', name: 'Mariam Keïta', status: 'En attente' },
];

const calendar = [
  { initials: 'AD', name: 'Amina Diallo', date: 'avril 2025' },
  { initials: 'MT', name: 'Moussa Traoré', date: 'mai 2025' },
  { initials: 'FS', name: 'Fatou Sow', date: 'juin 2025' },
];

const defaultMessages = {
  group: [
    { from: 'Amina Diallo', content: 'Bienvenue à tous !' },
    { from: 'Vous', content: 'Merci Amina !' },
  ],
  AD: [{ from: 'Amina Diallo', content: 'N’oublie pas ta cotisation.' }],
  MT: [{ from: 'Moussa Traoré', content: 'Salut, besoin d’aide ?' }],
  FS: [],
  IC: [],
  MK: [],
};

export default function TontinePage() {
  const [selectedUser, setSelectedUser] = useState('group');
  const [messages, setMessages] = useState(defaultMessages);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages((prev) => ({
      ...prev,
      [selectedUser]: [...prev[selectedUser], { from: 'Vous', content: newMessage }],
    }));
    setNewMessage('');
  };

  return (
    <div className="container">
      <h1 className="title">Tontine 'La Solidarité'</h1>

      <div className="beneficiary-card">
        <div>
          <p className="label">Prochain Bénéficiaire</p>
          <div className="beneficiary-initials">FS</div>
          <div className="beneficiary-name">Fatou Sow</div>
        </div>
        <div>
          <p className="label">Cagnotte Actuelle</p>
          <div className="amount">500 €</div>
        </div>
        <div>
          <p className="label">Date du Versement</p>
          <div className="date">15 juin 2025</div>
        </div>
      </div>

      <div className="grid-container">
        <div className="card">
          <h2>Membres et Cotisations</h2>
          {members.map((m, i) => (
            <div
              className="member-row"
              key={i}
              onClick={() => setSelectedUser(m.initials)}
              style={{ cursor: 'pointer' }}
            >
              <div className="member-info">
                <div className="avatar">{m.initials}</div>
                <span>{m.name}</span>
              </div>
              <div className={`status ${m.status.replace(' ', '-').toLowerCase()}`}>
                {m.status}
              </div>
            </div>
          ))}
        </div>

        <div className="card chat">
          <h2>
            {selectedUser === 'group'
              ? 'Conversation de Groupe'
              : `Discussion avec ${members.find((m) => m.initials === selectedUser)?.name}`}
          </h2>

          <div className="chat-box">
            {messages[selectedUser]?.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${msg.from === 'Vous' ? 'me' : 'them'}`}
              >
                <span><strong>{msg.from} :</strong> {msg.content}</span>
              </div>
            ))}
          </div>

          <div className="input-area">
            <input
              type="text"
              placeholder="Votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button className="send-button" onClick={handleSendMessage}>
              ➤
            </button>
          </div>

          {selectedUser !== 'group' && (
            <button className="back-button" onClick={() => setSelectedUser('group')}>
              ← Retour au groupe
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Calendrier des Bénéficiaires</h2>
        <ul className="calendar-list">
          {calendar.map((c, i) => (
            <li key={i}>
              <div className="dot"></div>
              <strong>{c.name}</strong> - {c.date}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
