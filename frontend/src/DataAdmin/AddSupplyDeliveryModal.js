import React, { useState, useEffect } from "react";
import "../css/AddItemModal.css"; // Your custom CSS for modal
import axios from "axios";
import apiUrl from "../ApiUrl/apiUrl";

const AddSupplyDeliveryModal = ({ isOpen, onClose, onAdd, suppliers }) => {
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [availableProducts, setAvailableProducts] = useState([]);
  const [addedProducts, setAddedProducts] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productPrice, setSelectedPrice] = useState(null);
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      if (selectedSupplier) {
        try {
          // Fetch products for the selected supplier
          const response = await axios.get(
            `${apiUrl}/getrawmaterials/${selectedSupplier}`
          );
          setAvailableProducts(response.data); // Store available products from the supplier
        } catch (error) {
          console.error("Error fetching products for supplier:", error);
        }
      }
    };

    if (isOpen) fetchProducts(); // Fetch products if modal is open
  }, [isOpen, selectedSupplier]);

  // Handle adding products to the order
  const handleAddProduct = (productId, quantity, price) => {
    if (quantity && price) {
      const existingProductIndex = addedProducts.findIndex(
        (item) => item.productId === productId
      );

      if (existingProductIndex === -1) {
        // Add new product to the list
        setAddedProducts((prev) => [
          ...prev,
          { productId, quantity, price, total: quantity * price },
        ]);
        // Remove the added product from available products
        setAvailableProducts((prev) =>
          prev.filter((prod) => prod.matId !== productId)
        );
      } else {
        // Update existing product quantity and total cost
        const updatedProducts = [...addedProducts];
        updatedProducts[existingProductIndex] = {
          ...updatedProducts[existingProductIndex],
          quantity: updatedProducts[existingProductIndex].quantity + quantity, // Increment quantity
          total:
            (updatedProducts[existingProductIndex].quantity + quantity) *
            price, // Recalculate total
        };
        setAddedProducts(updatedProducts);
      }

      // Update total cost
      setTotalCost((prev) => prev + quantity * price);

      // Reset quantity input field
      setQuantity("");
    } else {
      alert("Please enter both quantity and price.");
    }
  };

  const handleSelectProduct = (e) => {
    const price = availableProducts.find(
      (prod) => prod.matId.toString() === e.target.value
    );
    setSelectedProduct(e.target.value); // Set selected product ID
    setSelectedPrice(price.price);
  };

  // Handle removing products from the order
  const handleRemoveProduct = (productId) => {
    const updatedProducts = addedProducts.filter(
      (item) => item.productId !== productId
    );
    setAddedProducts(updatedProducts);

    // Recalculate total cost
    const removedProduct = addedProducts.find(
      (item) => item.productId === productId
    );
    setTotalCost((prev) => prev - removedProduct.total);

    // Add the removed product back to available products list
    const product = availableProducts.find((prod) => prod.matId === productId);
    if (product) {
      setAvailableProducts((prev) => [...prev, product]);
    }

    // If no products are in the added list, reset total cost to 0
    if (updatedProducts.length === 0) {
      setTotalCost(0);
    }
  };

  // Handle submitting the order
  const handleSubmit = (e) => {
    e.preventDefault();

    const orderDetails = {
      supplyId: selectedSupplier,
      products: addedProducts,
      totalCost,
    };
    console.log(orderDetails);
    onAdd(orderDetails); 
    onClose(); // Close modal after submission
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Order Products from Supplier</h2>
        <form onSubmit={handleSubmit}>
          {/* Supplier selection */}
          <label>Select Supplier:</label>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            required
          >
            <option value="">Select a Supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.supplyId} value={supplier.supplyId}>
                {supplier.supplyName}
              </option>
            ))}
          </select>

          {/* Product selection and quantity input */}
          {selectedSupplier && (
            <div className="product-selection">
              <label>Select Product:</label>
              <select
                id="product-select"
                value={selectedProduct}
                onChange={handleSelectProduct}
              >
                <option value="">Select a Product</option>
                {availableProducts.map((product) => (
                  <option key={product.matId} value={product.matId}>
                    {product.matName}
                  </option>
                ))}
              </select>

              <label>Enter Quantity:</label>
              <input
                type="number"
                id="quantity-input"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                
              />
              <span> </span>
              <label>Price:</label>
              <input
                type="number"
                id="price-input"
                placeholder="Price"
                value={productPrice}
                required
                disabled
              />

              <button
                type="button"
                onClick={() => {
                  const productId =
                    document.getElementById("product-select").value;
                  const quantity = document.getElementById("quantity-input").value;
                  const price = document.getElementById("price-input").value;

                  // Add product to the list
                  handleAddProduct(
                    productId,
                    parseInt(quantity),
                    parseFloat(price)
                  );
                }}
              >
                Add Product
              </button>
            </div>
          )}

          {/* Display added products */}
          <div className="added-products">
            <h4>Added Products:</h4>
            {addedProducts.length === 0 ? (
              <p>No products added yet.</p>
            ) : (
              <ul>
                {addedProducts.map((item, index) => (
                  <li key={index}>
                    {
                      availableProducts.find((p) => p.matId === item.productId)
                        ?.matName
                    }{" "}
                    - ₱{item.price} x {item.quantity} = ₱{item.total.toFixed(2)}
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(item.productId)}
                      style={{ marginLeft: "10px" }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Display total cost */}
          <div className="total-cost">
            <h4>Total Cost: ₱{totalCost.toFixed(2)}</h4>
          </div>

          {/* Submit button */}
          <div className="modal-footer">
            <button type="submit" onClick={handleSubmit}>Place Order</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupplyDeliveryModal;
