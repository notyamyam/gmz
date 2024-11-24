import React, { useState } from "react";
import "../css/ConfirmReceiveModal.css";

const DoneModal = ({ isOpen, onClose, onConfirm, item }) => {
  const [producedQuantity, setProducedQuantity] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    // Ensure producedQuantity is treated as a number
    const parsedProducedQuantity = Number(producedQuantity);

    // Check if the producedQuantity is a valid number
    if (
      !isNaN(parsedProducedQuantity) && // Check if it's a valid number
      parsedProducedQuantity > 0 && // Ensure it's greater than 0
      parsedProducedQuantity <= item.quantityProduced // Ensure it doesn't exceed the quantityProduced
    ) {
      console.log("Produced Quantity:", parsedProducedQuantity);
      onConfirm(item, parsedProducedQuantity);
      onClose();
      setProducedQuantity("");
      setError(""); // Reset error
    } else {
      setError(
        "Please enter a valid quantity between 1 and the ordered quantity."
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-content">
        <h2>Product Produced</h2>
        <hr></hr>
        <p>
          Product: <strong>{item.itemName}</strong>
        </p>
        <p>
          Quantity to Produced: <strong> {item.quantityProduced}</strong>
        </p>
        <div className="confirm-input-group">
          <input
            type="number"
            min="1"
            max={item.quantityProduced}
            value={producedQuantity}
            onChange={(e) => setProducedQuantity(e.target.value)}
            placeholder="Actual produced quantity"
          />
        </div>
        {error && <p className="confirm-error-message">{error}</p>}
        <div className="confirm-modal-actions">
          <button className="confirm-modal-confirm-btn" onClick={handleConfirm}>
            Confirm
          </button>
          <button className="confirm-modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoneModal;
