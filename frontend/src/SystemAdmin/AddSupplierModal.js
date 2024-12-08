import React, { useState, useEffect } from "react";
import "../css/AddItemModal.css";
import axios from "axios";
import apiUrl from "../ApiUrl/apiUrl";
import { toast } from "react-toastify";

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

    if (value.length <= 11) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const contactRegex = /^09\d{9}$/;

    if (!contactRegex.test(contact)) {
      toast.error("Number format is not correct.");
      return; // Prevent form submission if the contact is invalid
    }
    const newSupplier = {
      supplyName,
      contact,
      address,
      products: addedProducts,
    };

    onAdd(newSupplier);
    setSupplyName("");
    setContact("");
    setAddress("");
    setSelectedProduct("");
    setSelectedPrice("");
    setAddedProducts([]);
    onClose(); // Close the modal
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{ color: "gray" }}>
          <strong>Add New Supplier</strong>
        </h2>
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
              onChange={(e) => {
                const newValue = e.target.value;
                if (newValue >= 0 || newValue === "") {
                  setSelectedPrice(newValue);
                }
              }}
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
                <div>
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

          <div className="d-flex flex-column gap-2">
            {" "}
            <button type="submit">Add Supplier</button>
            <button
              type="button"
              onClick={() => {
                setSupplyName("");
                setContact("");
                setAddress("");
                setSelectedProduct("");
                setSelectedPrice("");
                setAddedProducts([]);

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

export default AddItemModal;
