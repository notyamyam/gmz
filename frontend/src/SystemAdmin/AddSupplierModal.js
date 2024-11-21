import React, { useState, useEffect } from "react";
import "../css/AddItemModal.css";
import axios from "axios";
import apiUrl from "../ApiUrl/apiUrl";

const AddItemModal = ({ isOpen, onClose, onAdd }) => {
  const [supplyName, setSupplyName] = useState("");
  const [contact, setContact] = useState("");
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [addedProducts, setAddedProducts] = useState([]);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${apiUrl}/rawmats`);
        setAvailableProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    if (isOpen) fetchProducts();
  }, [isOpen]);

  const handleContactChange = (e) => {
    const value = e.target.value;

    if (value.length <= 12) {
      setContact(value);
    }
  };

  const addProductToSupplier = () => {
    if (selectedProduct && selectedPrice) {
      // Check if the product is already added
      if (!addedProducts.some((item) => item.productId === selectedProduct)) {
        setAddedProducts((prev) => [
          ...prev,
          { productId: selectedProduct, price: selectedPrice },
        ]);
      } else {
        alert("This product has already been added.");
      }
      setSelectedProduct(""); // Clear the selected product after adding
      setSelectedPrice(""); // Clear the price input
    } else {
      alert("Please select a product and enter a price.");
    }
  };

  const handleRemoveProduct = (productId) => {
    setAddedProducts((prev) =>
      prev.filter((item) => item.productId !== productId)
    );
  };
console.log(addedProducts);
  const handleSubmit = (e) => {
    e.preventDefault();

    const newSupplier = {
      supplyName,
      contact,
      address,
      products: addedProducts, 
    };

    console.log(newSupplier);
    onAdd(newSupplier); // Call the onAdd function with the supplier data
    onClose(); // Close the modal
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Supplier</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Supplier Name"
            value={supplyName}
            onChange={(e) => setSupplyName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Contact No."
            value={contact}
            maxLength="12"
            onChange={handleContactChange}
            required
          />

          {/* Dropdown for selecting products and entering price */}
          <div className="product-selection">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">Select a Product</option>
              {availableProducts.map((product) => (
                <option key={product.matId} value={product.matId}>
                  {product.matName}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Price"
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              min="0"
              step="0.01"
            />
            <span> </span>
            <button type="button" onClick={addProductToSupplier}>
              Add Product
            </button>
          </div>

          {/* Display added products */}
          <div className="added-products">
            <h4>Added Products:</h4>
            {addedProducts.length === 0 ? (
              <p>No products added yet.</p>
            ) : (
              <ul>
                <div >
                  {addedProducts.map((item, index) => {
                    const product = availableProducts.find(
                      (p) => p.matId.toString() === item.productId
                    );
                    return (
                      <li key={index} style={{ marginBottom: "10px" }}>
                        {product?.matName || "Unknown Product"} - ₱{item.price}
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(item.productId)}
                          style={{ marginLeft: "10px" }}
                        >
                          Remove
                        </button>
                      </li>
                    );
                  })}
                </div>
              </ul>
            )}
          </div>

          <button type="submit">Add Supplier</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
