import React, { useState } from "react";
import "./ProfilePage.css";
import { FaUser, FaEnvelope, FaPhone, FaUniversity, FaIdCard, FaCheck, FaBirthdayCake, FaEdit } from "react-icons/fa";
import { MdVerifiedUser, MdScore } from "react-icons/md";
import EditPopup from "./EditPopup"; // nouveau composant

const ProfilePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);

  const userInfo = [
    { label: "Prénom", value: "Mansour", icon: <FaUser />, field: "first_name" },
    { label: "Nom", value: "Ndiaye", icon: <FaUser />, field: "last_name" },
    { label: "Email", value: "djamil@example.com", icon: <FaEnvelope />, field: "email" },
    { label: "Mot de passe", value: "********", icon: <FaCheck />, field: "password_hash"},
    { label: "Téléphone", value: "+221771234567", icon: <FaPhone />, field: "phone_number" },
    { label: "Date de naissance", value: "1995-08-20", icon: <FaBirthdayCake />, field: "date_of_birth" },
    { label: "Université", value: "UCAD", icon: <FaUniversity />, field: "university" },
    { label: "ID étudiant", value: "12345678", icon: <FaIdCard />, field: "student_id" },
    { label: "Vérifié", value: "Oui", icon: <MdVerifiedUser />, field: "is_verified", editable: false },
    { label: "Score de confiance", value: "100", icon: <MdScore />, field: "trust_score", editable: false },
  ];

  const handleEditClick = (field) => {
    setSelectedField(field);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedField(null);
  };

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="avatar" />
        <h2 className="user-name">Mansour Djamil Ndiaye</h2>
      </header>

      <div className="profile-menu">
        {userInfo.map((item, index) => (
          <div key={index} className="menu-item">
            <div className="item-left">
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}: {item.value}</span>
            </div>
            <div className="item-actions">
              {item.editable !== false && (
                <FaEdit className="edit-icon" onClick={() => handleEditClick(item)} />
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <EditPopup
          field={selectedField}
          onClose={handleClose}
          onSave={(newValue) => {
            // Simule la mise à jour de l'utilisateur (à adapter avec ton backend)
            console.log("Update:", selectedField.field, "→", newValue);
            handleClose();
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;
