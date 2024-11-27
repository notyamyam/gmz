import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/AddItemModal.css"; // You can style your modal here
import apiUrl from "../ApiUrl/apiUrl";

function ItemDetailsModal({ isOpen, onClose, item }) {
  const [itemDetails, setItemDetails] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [showIngredients, setShowIngredients] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      fetchItemDetails(item.itemId);
      fetchItemIngredients(item.itemId);
    }
  }, [isOpen, item]);

  const fetchItemDetails = async (itemId) => {
    try {
      const response = await axios.get(`${apiUrl}/inventory-data/${itemId}`);
      setItemDetails(response.data);
    } catch (error) {
      console.error("Error fetching ItemDetails:", error);
    }
  };

  const fetchItemIngredients = async (itemId) => {
    try {
      const response = await axios.get(`${apiUrl}/item/${itemId}/materials`);
      setIngredients(response.data);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  if (!isOpen || !item) {
    return null; // Don't render if the modal is not open
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Details for {item.itemName}</h2>
        <table className="modal-table">
          <thead>
            <tr>
              <td>Batch ID</td>
              <th>Production Quantity</th>
              <th>Remaining Quantity</th>
              <th>Production Date</th>
              <th>Staff</th>
            </tr>
          </thead>
          <tbody>
            {itemDetails.map((detail, index) => (
              <tr key={index}>
                <td>{"Batch#000" + detail.productionId}</td>
                <td>{detail.actualQuantityProduced}</td>
                <td>{detail.quantityProduced}</td>
                <td>{new Date(detail.productionDate).toLocaleDateString()}</td>
                <td>{detail.staffName}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          className="toggle-ingredients-button"
          onClick={() => setShowIngredients(!showIngredients)}
        >
          {showIngredients ? "Hide Ingredients" : "Show Ingredients"}
        </button>

        {showIngredients && (
          <div className="ingredients-table-container">
            <h3>Ingredients</h3>
            <table className="modal-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ingredient Name</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ingredient, index) => (
                  <tr key={ingredient.matId}>
                    <td>{index + 1}</td>
                    <td>{ingredient.matName}</td>
                    <td>{ingredient.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default ItemDetailsModal;
