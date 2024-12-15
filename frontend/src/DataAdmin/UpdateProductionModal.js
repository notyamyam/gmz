import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/AddItemModal.css"; // You can style your modal here
import apiUrl from "../ApiUrl/apiUrl";

function UpdateProductionModal({
  isOpen,
  onClose,
  items,
  productionId,
  onUpdate,
}) {
  const [production, setProduction] = useState({
    itemId: "",
    quantityProduced: "",
    staffName: "",
  });
  const [insufficientMaterials, setInsufficientMaterials] = useState([]);
  const initialFetchComplete = useRef(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      console.log("Modal is closing, resetting production state.");
      setProduction({
        itemId: "",
        quantityProduced: "",
        staffName: "",
      });
      initialFetchComplete.current = false; // Reset fetch flag when modal closes
      setInsufficientMaterials([]); // Reset insufficient materials state
    }
  }, [isOpen]);

  // Fetch production details when modal opens and the productionId is set
  useEffect(() => {
    if (isOpen && productionId && !initialFetchComplete.current) {
      console.log(`Fetching production data for productionId: ${productionId}`);
      const fetchProduction = async () => {
        try {
          const response = await axios.get(
            `${apiUrl}/production/${productionId}`
          );
          console.log("Fetched production data:", response.data);

          const productionData = response.data[0] || {};
          if (!productionData) {
            console.log("No production data found");
            return;
          }

          setProduction({
            itemId: productionData.itemId || "",
            quantityProduced: productionData.quantityProduced || "",
            staffName: productionData.staffName || "",
          });
          initialFetchComplete.current = true; // Mark fetch as complete
        } catch (error) {
          console.error("Error fetching production:", error);
          // Set error message here if needed
        }
      };
      fetchProduction();
    }
  }, [isOpen, productionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduction((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleChangeWithName = (e) => {
    const { name, value } = e.target;
    const item = items.find((item) => item.itemId == value);
    setProduction((prevState) => ({ ...prevState, itemName: item.itemName }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting production update:", production);
    try {
      await axios
        .put(`${apiUrl}/updateProduction/${productionId}`, {
          ...production,
          username: localStorage.getItem("username"),
          access: localStorage.getItem("access"),
        })
        .then((res) => {
          console.log(res.data);

          toast.success("Production record updated successfully!");
          onUpdate(); // Refresh the data after update
          onClose(); // Close the modal
        })
        .catch((err) => {
          console.log("err", err);
          setInsufficientMaterials(err.response.data.insufficientMaterials);
        });
    } catch (error) {
      console.error("Error updating production:", error);
      toast.error("Failed to update production record!");
    }
  };

  return (
    isOpen && (
      <>
        <div id="addModal" className="modal-overlay">
          <div className="modal-content">
            <span className="close" onClick={onClose}>
              &times;
            </span>
            <h2>Update Production Record</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Item</label>
                <select
                  name="itemId"
                  value={production.itemId}
                  onChange={(e) => {
                    handleChange(e);
                    handleChangeWithName(e);
                  }}
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
                <label>Quantity Produced</label>
                <input
                  type="number"
                  name="quantityProduced"
                  value={production.quantityProduced}
                  onChange={(e) =>
                    setProduction({
                      ...production,
                      quantityProduced: e.target.value,
                    })
                  }
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
                Update
              </button>
            </form>

            {/* Display Insufficient Materials */}
            {insufficientMaterials?.length > 0 && (
              <div className="insufficient-materials">
                <h3>Insufficient Materials</h3>
                <ul>
                  {insufficientMaterials.map((material) => (
                    <li key={material.matId}>
                      {material.matName} - Available:{" "}
                      {material.availableQuantity}, Required:{" "}
                      {material.requiredQuantity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </>
    )
  );
}

export default UpdateProductionModal;
