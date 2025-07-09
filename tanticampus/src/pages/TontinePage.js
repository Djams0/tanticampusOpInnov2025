import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './TontinePage.css';

const TontinePage = () => {
  const { id } = useParams();
  const [tontineData, setTontineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState('group');
  const [messages, setMessages] = useState({ group: [] });
  const [newMessage, setNewMessage] = useState('');
  const [showOptions, setShowOptions] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');

  // Fetch tontine data
  useEffect(() => {
    const fetchTontineData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:3000/api/tontine-details/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Tontine non trouvée' : 'Erreur lors du chargement');
        }

        const data = await response.json();
        setTontineData(data);
        
        // Initialize messages with participants
        const initialMessages = { group: [] };
        data.participants.forEach(participant => {
          initialMessages[participant.id] = [];
        });
        setMessages(initialMessages);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTontineData();
  }, [id]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/tontine-details/send-group-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tontine_id: id,
          content: newMessage
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }

      const data = await response.json();
      
      // Update local state
      setMessages(prev => ({
        ...prev,
        group: [...prev.group, { from: 'Vous', content: newMessage }]
      }));
      setNewMessage('');
    } catch (err) {
      setAlertMessage(err.message);
    }
  };

  // Handle warning a participant
  const sendAlert = async (userId) => {
    const reason = prompt("Entrez le message d'avertissement :");
    if (!reason) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/tontine-details/warn-participant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tontine_id: id,
          user_id: userId,
          reason
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'avertissement');
      }

      // Update local state
      setMessages(prev => ({
        ...prev,
        [userId]: [...(prev[userId] || []), { from: 'Admin', content: `⚠️ ${reason}` }]
      }));
      setShowOptions(null);
    } catch (err) {
      setAlertMessage(err.message);
    }
  };

  // Handle accepting/rejecting a request
  const handleRequest = async (requestId, action) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/tontine-details/handle-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          request_id: requestId,
          action
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de ${action === 'accept' ? 'l\'acceptation' : 'le rejet'} de la demande`);
      }

      // Refresh tontine data
      const updatedResponse = await fetch(`http://localhost:3000/api/tontine-details/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const updatedData = await updatedResponse.json();
      setTontineData(updatedData);
    } catch (err) {
      setAlertMessage(err.message);
    }
  };

  // Handle updating beneficiary order
  const updateBeneficiaryOrder = async (newOrder) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/tontine-details/update-beneficiary-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tontine_id: id,
          new_order: newOrder
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de l\'ordre');
      }

      // Refresh tontine data
      const updatedResponse = await fetch(`http://localhost:3000/api/tontine-details/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const updatedData = await updatedResponse.json();
      setTontineData(updatedData);
    } catch (err) {
      setAlertMessage(err.message);
    }
  };

  // Handle removing a participant
  const removeParticipant = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/tontine-details/remove-participant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tontine_id: id,
          user_id: userId
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du participant');
      }

      // Refresh tontine data
      const updatedResponse = await fetch(`http://localhost:3000/api/tontine-details/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const updatedData = await updatedResponse.json();
      setTontineData(updatedData);
    } catch (err) {
      setAlertMessage(err.message);
    }
  };

  // Fetch group messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:3000/api/tontine-details/group-messages/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des messages');
        }

        const data = await response.json();
        setMessages(prev => ({
          ...prev,
          group: data.map(msg => ({
            from: `${msg.first_name} ${msg.last_name}`,
            content: msg.content
          }))
        }));
      } catch (err) {
        console.error(err);
      }
    };

    if (tontineData) {
      fetchMessages();
    }
  }, [id, tontineData]);

  if (loading) return <div className="container">Chargement...</div>;
  if (error) return <div className="container">Erreur: {error}</div>;
  if (!tontineData) return <div className="container">Aucune donnée disponible</div>;

  return (
    <div className="container">
      <div className="tontine-header">
        <h1 className="title">Tontine '{tontineData.tontine.title}'</h1>
        <div className="tontine-code">
          <span>Code de la tontine : </span>
          <strong>{tontineData.tontine.tontine_code}</strong>
        </div>
      </div>

      <div className="beneficiary-card">
        <div>
          <p className="label">Prochain Bénéficiaire</p>
          {tontineData.nextBeneficiary ? (
            <>
              <div className="beneficiary-initials">
                {tontineData.nextBeneficiary.first_name.charAt(0)}{tontineData.nextBeneficiary.last_name.charAt(0)}
              </div>
              <div className="beneficiary-name">
                {tontineData.nextBeneficiary.first_name} {tontineData.nextBeneficiary.last_name}
              </div>
            </>
          ) : (
            <div className="beneficiary-name">À déterminer</div>
          )}
        </div>
        <div>
          <p className="label">Cagnotte Actuelle</p>
          <div className="amount">{tontineData.pot.currentAmount} €</div>
        </div>
        <div>
          <p className="label">Date du Versement</p>
          <div className="date">
            {new Date(tontineData.tontine.start_date).toLocaleDateString('fr-FR')}
          </div>
        </div>
      </div>

      <div className="grid-container">
        <div className="card">
          <h2>Membres et Cotisations</h2>
          {tontineData.participants.map((participant) => (
            <div
              className="member-row"
              key={participant.user_id}
              onClick={() => setSelectedUser(participant.user_id)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <div className="member-info">
                <div className="avatar">
                  {participant.first_name.charAt(0)}{participant.last_name.charAt(0)}
                </div>
                <span>{participant.first_name} {participant.last_name}</span>
              </div>
              <div className={`status ${participant.has_received ? 'bénéficiaire' : participant.is_active ? 'payé' : 'en-attente'}`}>
                {participant.has_received ? 'Bénéficiaire' : participant.is_active ? 'Payé' : 'En attente'}
              </div>
              <div 
                className="options-menu-trigger" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptions(showOptions === participant.user_id ? null : participant.user_id);
                }}
              >
                ⋮
              </div>

              {showOptions === participant.user_id && (
                <div className="options-menu">
                  <button onClick={() => sendAlert(participant.user_id)}>⚠️ Avertir</button>
                  {participant.role !== 'admin' && (
                    <button onClick={() => removeParticipant(participant.user_id)}>🗑️ Supprimer</button>
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
              : `Discussion avec ${tontineData.participants.find(p => p.user_id === selectedUser)?.first_name}`}
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
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
          {tontineData.participants
            .filter(p => p.has_received || p.is_active)
            .map((participant, i) => (
              <li key={i}>
                <div className="dot"></div>
                <strong>{participant.first_name} {participant.last_name}</strong> - 
                {participant.has_received ? ' A déjà reçu' : ' Prochain bénéficiaire'}
              </li>
            ))}
        </ul>
      </div>

      {tontineData.pendingRequests.length > 0 && (
        <div className="card">
          <h2>Demandes en attente</h2>
          {tontineData.pendingRequests.map((request) => (
            <div key={request.id} className="member-row">
              <div className="member-info">
                <div className="avatar">
                  {request.first_name.charAt(0)}{request.last_name.charAt(0)}
                </div>
                <span>{request.first_name} {request.last_name}</span>
              </div>
              <div>
                <button 
                  className="accept" 
                  onClick={() => handleRequest(request.id, 'accept')}
                >
                  Accepter
                </button>
                <button 
                  className="reject" 
                  onClick={() => handleRequest(request.id, 'reject')}
                >
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {alertMessage && (
        <div className="alert-message">
          {alertMessage}
          <button onClick={() => setAlertMessage('')}>×</button>
        </div>
      )}
    </div>
  );
};

export default TontinePage;