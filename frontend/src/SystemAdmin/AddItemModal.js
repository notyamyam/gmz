import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/AddItemModal.css";
import apiUrl from "../ApiUrl/apiUrl";

const AddItemModal = ({ isOpen, onClose, onAdd }) => {
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [materialList, setMaterialList] = useState([]);
  const [addedMaterials, setAddedMaterials] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const categoryResponse = await axios.get(`${apiUrl}/categories/inventory`);
      setCategories(categoryResponse.data);

      const materialResponse = await axios.get(`${apiUrl}/rawmats`);
      setMaterialList(materialResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddMaterial = () => {
    if (!selectedMaterial) return;
    const material = materialList.find((mat) => mat.matId === Number(selectedMaterial));
    if (material && !addedMaterials.some((mat) => mat.matId === material.matId)) {
      setAddedMaterials([...addedMaterials, material]);
    }
    setSelectedMaterial("");
  };

  const handleRemoveMaterial = (matId) => {
    setAddedMaterials(addedMaterials.filter((mat) => mat.matId !== matId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      itemName,
      price,
      category,
      description,
      materials: addedMaterials.map((mat) => mat.matId),
    };
    onAdd(newItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div id="addModal" className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Item</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
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
          <div>
            <h4>Materials/Ingredients</h4>
            <div className="d-flex">
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
              >
                <option value="" disabled>
                  Select Material
                </option>
                {materialList.map((mat) => (
                  <option key={mat.matId} value={mat.matId}>
                    {mat.matName}
                  </option>
                ))}
              </select>
              <button type="button" onClick={handleAddMaterial}>
                Add
              </button>
            </div>
            <ul>
              {addedMaterials.map((mat) => (
                <li key={mat.matId}>
                  {mat.matName}
                  <button type="button" onClick={() => handleRemoveMaterial(mat.matId)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <button type="submit">Add Item</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
