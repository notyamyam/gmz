import React, { useState } from "react";
import "../css/ConfirmReceiveModal.css";

const ConfirmReceiveModal = ({ isOpen, onClose, onConfirm, item }) => {
  const [receivedQuantity, setReceivedQuantity] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (receivedQuantity && receivedQuantity > 0 && receivedQuantity <= item.quantity) {
      onConfirm(item, receivedQuantity);
      setReceivedQuantity("");
      setError("");
      onClose();
    } else {
      setError("Please enter a valid quantity between 1 and the ordered quantity.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-content">
        <h2>Confirm Product Received</h2>
        <p>Product: <strong>{item.matName}</strong></p>
        <p>Ordered Quantity: {item.quantity}</p>
        <div className="confirm-input-group">
        
          <input
            type="number"
            min="1"
            max={item.quantity}
            value={receivedQuantity}
            onChange={(e) => setReceivedQuantity(e.target.value)}
            placeholder="Enter received quantity"
          />
        </div>
        {error && <p className="confirm-error-message">{error}</p>}
        <div className="confirm-modal-actions">
          <button className="confirm-modal-confirm-btn" onClick={handleConfirm}>Confirm</button>
          <button className="confirm-modal-cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmReceiveModal;
