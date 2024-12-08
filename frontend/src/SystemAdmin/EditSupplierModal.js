import React, { useEffect, useState } from "react";
import "../css/AddItemModal.css";
import axios from "axios";
import apiUrl from "../ApiUrl/apiUrl";

function EditSupplierModal({ isOpen, onClose, supplier, onUpdate }) {
  const [supplyName, setSupplyName] = useState("");
  const [contact, setContact] = useState("");
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [addedProducts, setAddedProducts] = useState([]);
  const [supplyId, setSupplyId] = useState(0);

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

  // Fetch raw materials and prices for the selected supplier from tblsupplierrawmats
  useEffect(() => {
    const fetchSupplierProducts = async () => {
      if (supplier && supplier.supplyId) {
        try {
          const response = await axios.get(
            `${apiUrl}/supplier/${supplier.supplyId}/rawmats`
          );

          setAddedProducts(response.data); // Assuming response contains an array of { rawMatId, price }
        } catch (error) {
          console.error("Error fetching supplier products:", error);
        }
      }
    };

    if (supplier) {
      setSupplyName(supplier.supplyName || "");
      setContact(supplier.contact || "");
      setSupplyId(supplier.supplyId || 0);
      fetchSupplierProducts();
    }
  }, [supplier]);

  const addProductToSupplier = () => {
    if (selectedProduct && selectedPrice) {
      // Check if the product is already added
      if (!addedProducts.find((p) => p.rawMatId === selectedProduct)) {
        setAddedProducts((prev) => [
          ...prev,
          { rawMatId: selectedProduct, price: parseFloat(selectedPrice) || 0 },
        ]);
      } else {
        alert("This product has already been added.");
      }
      setSelectedProduct("");
      setSelectedPrice("");
    } else {
      alert("Please select a product and set a price.");
    }
  };

  const handleRemoveProduct = (productId) => {
    setAddedProducts((prev) => prev.filter((p) => p.rawMatId !== productId));
  };

  const handlePriceChange = (productId, newPrice) => {
    setAddedProducts((prev) =>
      prev.map((p) =>
        p.rawMatId === productId
          ? { ...p, price: parseFloat(newPrice) || 0 }
          : p
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedSupplier = {
      supplyId,
      supplyName,
      contact,
      product: addedProducts,
    };
    onUpdate(updatedSupplier);
    onClose(); // Close modal after update
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{ color: "gray" }}>
          <strong>Edit Supplier</strong>
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
            placeholder="Contact No."
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />

          {/* Dropdown for selecting products */}
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
            />
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
                {addedProducts.map(({ rawMatId, price }, index) => {
                  // Find the product by ID in availableProducts
                  const product = availableProducts.find(
                    (p) =>
                      p.matId &&
                      p.matId.toString() === (rawMatId?.toString() || "")
                  );
                  return (
                    <li key={index}>
                      {product ? product.matName : "Unknown Product"} - ₱
                      <input
                        type="number"
                        value={price}
                        onChange={(e) =>
                          handlePriceChange(rawMatId, e.target.value)
                        }
                        style={{ width: "70px", marginLeft: "10px" }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(rawMatId)}
                        style={{ marginLeft: "10px" }}
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="d-flex flex-column gap-2">
            {" "}
            <button type="submit">Update Supplier</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSupplierModal;
