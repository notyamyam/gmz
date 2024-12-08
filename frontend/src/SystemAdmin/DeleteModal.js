// DeleteModal.js
import React from "react";
import "../css/AddItemModal.css"; // You can style your modal here

const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div id="addModal" className="modal-overlay">
      <div className="modal-content">
        <h2>
          <strong>Are you sure you want to delete it?</strong>
        </h2>
        <p style={{ color: "gray" }}>
          <i>This action cannot be undone</i>
        </p>
        <div className="d-flex justify-content-end gap-2">
          <button onClick={onClose} className="btn btn-light">
            Discard
          </button>
          <button onClick={onConfirm} className="btn btn-danger">
            Delete it
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
