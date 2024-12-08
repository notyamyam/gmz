import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/AddItemModal.css"; // You can style your modal here
import apiUrl from "../ApiUrl/apiUrl";

function ViewMaterialsModal({ isOpen, onClose, materials }) {
  if (!isOpen) {
    return null; // Don't render if the modal is not open
  }

  console.log("modal >", materials);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{ color: "gray" }}>
          <strong>Material Used</strong>
        </h2>
        <table>
          <thead>
            <tr>
              <th>Material Name</th>
              <th>Category</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {materials?.map((detail, index) => (
              <tr key={index}>
                <td>{detail.matName}</td>

                <td>{detail.category}</td>
                <td>{detail.quantityUsed}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ViewMaterialsModal;
