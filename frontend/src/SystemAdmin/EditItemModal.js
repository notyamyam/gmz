import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/AddItemModal.css";
import apiUrl from "../ApiUrl/apiUrl";

const EditItemModal = ({ isOpen, onClose, item, onUpdate }) => {
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [materialList, setMaterialList] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");

  useEffect(() => {
    console.log(item);
    if (item) {
      setItemName(item.itemName);
      setPrice(item.price);
      setCategory(item.category);
      setDescription(item.description);
      setMaterials(item.materials || []);
    }
  }, [item]);

  useEffect(() => {
    if (isOpen) {
      fetchCategoriesAndMaterials(item.itemId);
    }
  }, [isOpen]);

  const fetchCategoriesAndMaterials = async (id) => {
    try {
      const categoryResponse = await axios.get(
        `${apiUrl}/categories/inventory`
      );
      setCategories(categoryResponse.data);

      const materialResponse = await axios.get(`${apiUrl}/rawmats`);
      setMaterialList(materialResponse.data);

      axios
        .get(`${apiUrl}/item/${item.itemId}/materials`)
        .then((response) => {
          setMaterials(response.data);
        })
        .catch((error) => {
          console.error("Error fetching item materials:", error);
        });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddMaterial = () => {
    if (!selectedMaterial) return;
    const material = materialList.find(
      (mat) => mat.matId === Number(selectedMaterial)
    );
    if (material && !materials.some((mat) => mat.matId === material.matId)) {
      setMaterials([...materials, material]);
    }
    setSelectedMaterial("");
  };

  const handleRemoveMaterial = (matId) => {
    setMaterials(materials.filter((mat) => mat.matId !== matId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedItem = {
      ...item,
      itemName,
      price,
      category,
      description,
      materials: materials.map((mat) => mat.matId), // Send only material IDs
    };

    onUpdate(updatedItem);
    onClose(); // Close the modal
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Item</h2>
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
            onChange={(e) => {
              const newValue = e.target.value;
              if (newValue >= 0 || newValue === "") {
                setPrice(newValue);
              }
            }}
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
              {materials.map((mat) => (
                <li key={mat.matId}>
                  {mat.matName}
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(mat.matId)}
                  >
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
          <button type="submit">Update Item</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;
