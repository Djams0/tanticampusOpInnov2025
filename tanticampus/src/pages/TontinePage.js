import React, { useState } from 'react';
import './TontinePage.css';

const initialMembers = [
  { initials: 'AD', name: 'Amina Diallo', status: 'Payé' },
  { initials: 'MT', name: 'Moussa Traoré', status: 'Payé' },
  { initials: 'FS', name: 'Fatou Sow', status: 'Bénéficiaire' },
  { initials: 'IC', name: 'Ibrahim Coulibaly', status: 'En attente' },
  { initials: 'MK', name: 'Mariam Keïta', status: 'En attente' },
];

const initialCalendar = [
  { initials: 'FS', name: 'Fatou Sow', date: 'juin 2025' },
  { initials: 'IC', name: 'Ibrahim Coulibaly', date: 'juillet 2025' },
  { initials: 'MK', name: 'Mariam Keïta', date: 'août 2025' },
];

const demandes = [
  { initials: 'BN', name: 'Binta Ndiaye' },
  { initials: 'TS', name: 'Tidiane Sy' },
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
  const [calendar, setCalendar] = useState(initialCalendar);
  const [showOptions, setShowOptions] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages((prev) => ({
      ...prev,
      [selectedUser]: [...prev[selectedUser], { from: 'Vous', content: newMessage }],
    }));
    setNewMessage('');
  };

  const sendAlert = (initials) => {
    const msg = prompt("Entrez le message d'avertissement :");
    if (msg) {
      setMessages((prev) => ({
        ...prev,
        [initials]: [...(prev[initials] || []), { from: 'Admin', content: `⚠️ ${msg}` }],
      }));
    }
    setShowOptions(null);
  };

  const moveInCalendar = (initials, direction) => {
    const idx = calendar.findIndex(c => c.initials === initials);
    if (idx === -1) return;

    const newCalendar = [...calendar];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;

    if (targetIdx < 0 || targetIdx >= calendar.length) return;

    [newCalendar[idx], newCalendar[targetIdx]] = [newCalendar[targetIdx], newCalendar[idx]];
    setCalendar(newCalendar);
    setShowOptions(null);
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
          {initialMembers.map((m, i) => (
            <div
              className="member-row"
              key={i}
              onClick={() => setSelectedUser(m.initials)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <div className="member-info">
                <div className="avatar">{m.initials}</div>
                <span>{m.name}</span>
              </div>
              <div className={`status ${m.status.replace(' ', '-').toLowerCase()}`}>
                {m.status}
              </div>
              <div className="options-menu-trigger" onClick={(e) => {
                e.stopPropagation();
                setShowOptions(showOptions === m.initials ? null : m.initials);
              }}>⋮</div>

              {showOptions === m.initials && (
                <div className="options-menu">
                  <button onClick={() => sendAlert(m.initials)}>⚠️ Avertir</button>
                  {calendar.some(c => c.initials === m.initials) && (
                    <>
                      <button onClick={() => moveInCalendar(m.initials, 'up')}>⬆️ Monter</button>
                      <button onClick={() => moveInCalendar(m.initials, 'down')}>⬇️ Descendre</button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="card chat">
          <h2>
            {selectedUser === 'group'
              ? 'Conversation de Groupe'
              : `Discussion avec ${initialMembers.find((m) => m.initials === selectedUser)?.name}`}
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

      <div className="card">
        <h2>Demandes en attente</h2>
        {demandes.map((d, i) => (
          <div key={i} className="member-row">
            <div className="member-info">
              <div className="avatar">{d.initials}</div>
              <span>{d.name}</span>
            </div>
            <div>
              <button className="accept">Accepter</button>
              <button className="reject">Refuser</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
