import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/AddItemModal.css"; // You can style your modal here
import apiUrl from "../ApiUrl/apiUrl";

const AddRawMatsModal = ({ isOpen, onClose, onAdd }) => {
  const [matName, setMatName] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [threshold, setThreshold] = useState("");
  useEffect(() => {
    if (isOpen) {
      axios
        .get(`${apiUrl}/categories/rawMaterials`)
        .then((response) => {
          setCategories(response.data);
        })
        .catch((error) => {
          console.error("Error fetching raw materials categories:", error);
        });
    }
  }, [isOpen]); // Runs when the modal opens

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMat = { matName, category, threshold }; // Include quantity in newMat
    onAdd(newMat);
    setMatName("");
    setCategory("");
    setThreshold("");
    onClose(); // Close the modal after adding
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{ color: "gray" }}>
          <strong>Add Raw Material</strong>
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Material Name"
            value={matName}
            onChange={(e) => setMatName(e.target.value)}
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="" disabled>
              Select Category
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.categoryName}>
                {cat.categoryName}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Threshold"
            value={threshold}
            onChange={(e) => {
              setThreshold(e.target.value);
            }}
            required
          />
          <div className="d-flex flex-column gap-2">
            {" "}
            <button type="submit">Add Material</button>
            <button
              type="button"
              onClick={() => {
                setMatName("");
                setCategory("");
                onClose();
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRawMatsModal;
