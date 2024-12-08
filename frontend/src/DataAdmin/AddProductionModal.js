import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../css/AddItemModal.css";
import apiUrl from "../ApiUrl/apiUrl";

function AddProductionModal({ isOpen, onClose, items, onAdd }) {
  const [production, setProduction] = useState({
    itemId: "",
    quantityToProduce: "",
    staffName: "",
  });
  const [insufficientMaterials, setInsufficientMaterials] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduction((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/produce`, production);
      toast.success(response.data.message);
      onAdd(); // Refresh data
      setProduction({
        itemId: "",
        quantityToProduce: "",
        staffName: "",
      }); // Reset the form fields
      onClose(); // Close the modal
    } catch (error) {
      if (error.response && error.response.data.insufficientMaterials) {
        setInsufficientMaterials(error.response.data.insufficientMaterials);
      } else {
        console.error("Error producing product:", error);
        toast.error("Failed to initiate production.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div id="addModal" className="modal-overlay">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2>Add Production Record</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Item</label>
            <select
              name="itemId"
              value={production.itemId}
              onChange={handleChange}
              required
            >
              <option value="">Select an item</option>
              {items.map((item) => (
                <option key={item.itemId} value={item.itemId}>
                  {item.itemName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Quantity to Produce</label>
            <input
              type="number"
              name="quantityProduced"
              value={production.quantityToProduce}
              onChange={(e) => {
                const newValue = e.target.value;
                if (newValue >= 0 || newValue === "") {
                  setProduction({
                    ...production,
                    quantityToProduce: newValue,
                  });
                }
              }}
              required
            />
          </div>
          <div className="form-group">
            <label>Staff</label>
            <input
              type="text"
              name="staffName"
              value={production.staffName}
              onChange={handleChange}
              required
            />
          </div>
          <button className="btn" type="submit">
            Add
          </button>
        </form>

        {insufficientMaterials?.length > 0 && (
          <div className="insufficient-materials">
            <h3>Insufficient Materials</h3>
            <ul>
              {insufficientMaterials.map((material) => (
                <li key={material.matId}>
                  {material.matName} - Available: {material.availableQuantity},
                  Required: {material.requiredQuantity}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddProductionModal;
