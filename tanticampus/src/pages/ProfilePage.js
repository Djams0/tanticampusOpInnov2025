import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import {
  FaUser, FaEnvelope, FaPhone, FaUniversity, FaIdCard,
  FaCheck, FaBirthdayCake, FaEdit
} from "react-icons/fa";
import { MdVerifiedUser, MdScore } from "react-icons/md";
import EditPopup from "./EditPopup";
import axios from "axios";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Erreur 401 : Aucun token d'authentification trouvé.");
          return;
        }

        const response = await axios.get("http://localhost:3000/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUserData(response.data);
      } catch (err) {
        console.error("Erreur lors de la récupération du profil :", err);
        if (err.response) {
          // Erreur du backend avec un code de statut
          setError(`Erreur ${err.response.status} : ${err.response.data.error || "Erreur inconnue du serveur."}`);
        } else if (err.request) {
          // Requête envoyée mais pas de réponse
          setError("Erreur réseau : aucune réponse du serveur.");
        } else {
          // Erreur de configuration
          setError(`Erreur : ${err.message}`);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleEditClick = (field) => {
    setSelectedField(field);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedField(null);
  };

  const fieldConfig = [
    { label: "Prénom", icon: <FaUser />, key: "firstName", editable: true },
    { label: "Nom", icon: <FaUser />, key: "lastName", editable: true },
    { label: "Email", icon: <FaEnvelope />, key: "email", editable: false },
    { label: "Mot de passe", icon: <FaCheck />, key: "password", value: "********", editable: true },
    { label: "Téléphone", icon: <FaPhone />, key: "phoneNumber", editable: true },
    { label: "Date de naissance", icon: <FaBirthdayCake />, key: "dateOfBirth", editable: true },
    { label: "Université", icon: <FaUniversity />, key: "university", editable: true },
    { label: "ID étudiant", icon: <FaIdCard />, key: "studentId", editable: true },
    { label: "Vérifié", icon: <MdVerifiedUser />, key: "isVerified", editable: false },
    { label: "Score de confiance", icon: <MdScore />, key: "trustScore", editable: false },
    { label: "Solde", icon: <FaCheck />, key: "walletBalance", editable: false }
  ];

  if (error) {
    return (
      <div className="profile-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-container">
        <p>Chargement des informations du profil...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="avatar">
          <img src="/profile.png" alt="profil" className="profile-img" />
        </div>
        <h2 className="user-name">{userData.firstName} {userData.lastName}</h2>
      </header>

      <div className="profile-menu">
        {fieldConfig.map((field, index) => {
          const value = field.key === "password"
            ? field.value
            : userData[field.key] ?? "Non renseigné";

          return (
            <div key={index} className="menu-item">
              <div className="item-left">
                <span className="icon">{field.icon}</span>
                <span className="label">{field.label}: {String(value)}</span>
              </div>
              <div className="item-actions">
                {field.editable && (
                  <FaEdit className="edit-icon" onClick={() => handleEditClick({
                    field: field.key,
                    label: field.label,
                    value: userData[field.key] || ""
                  })} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <EditPopup
          field={selectedField}
          onClose={handleClose}
          onSave={(newValue) => {
            console.log("Sauvegarde :", selectedField.field, "→", newValue);
            // À remplacer par un PUT API call
            handleClose();
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;
