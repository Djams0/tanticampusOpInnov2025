import React from "react";
import "./ProfilePage.css";
import { FaUser, FaWallet, FaCoins, FaCalendarAlt, FaCog, FaQuestionCircle, FaEdit } from "react-icons/fa";
import { RiGroup2Line } from "react-icons/ri";

const ProfilePage = () => {
  const menuItems = [
    { icon: <FaUser />, label: "Mon profil" },
    { icon: <RiGroup2Line />, label: "Mes tontines" },
    { icon: <FaWallet />, label: "Mon Wallet" },
    { icon: <FaCoins />, label: "Code Privilège" },
    { icon: <FaCalendarAlt />, label: "Mes évènements" },
    { icon: <FaCog />, label: "Paramètres" },
    { icon: <FaQuestionCircle />, label: "Aide" },
  ];

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="avatar" />
        <h2 className="user-name">Mansour Djamil Ndiaye</h2>
      </header>

      <div className="profile-menu">
        {menuItems.map((item, index) => (
          <div key={index} className="menu-item">
            <div className="item-left">
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </div>
            <div className="item-actions">
              <span className="check">✔</span>
              <FaEdit className="edit-icon" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
