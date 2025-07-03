import React, { useState } from "react";
import "./EditPopup.css";

const EditPopup = ({ field, onClose, onSave }) => {
  const [inputValue, setInputValue] = useState(field.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(inputValue);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h3>Modifier {field.label}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            required
          />
          <div className="popup-actions">
            <button type="submit">Valider</button>
            <button type="button" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPopup;
