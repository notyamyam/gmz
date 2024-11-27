import React, { useState, useEffect } from "react";
import "../css/AddItemModal.css"; // Your custom CSS for modal
import axios from "axios";
import apiUrl from "../ApiUrl/apiUrl";

const AddSupplyDeliveryModal = ({ isOpen, onClose, onAdd, suppliers }) => {
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [availableProducts, setAvailableProducts] = useState([]);
  const [addedProducts, setAddedProducts] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [productPrice, setSelectedPrice] = useState(0);
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      if (selectedSupplier) {
        try {
          // Fetch products for the selected supplier
          const response = await axios.get(
            `${apiUrl}/getrawmaterials/${selectedSupplier}`
          );
          setAvailableProducts(response.data);
        } catch (error) {
          console.error("Error fetching products for supplier:", error);
        }
      }
    };

    if (isOpen) fetchProducts(); // Fetch products if modal is open
  }, [isOpen, selectedSupplier]);

  // Handle adding products to the order
  const handleAddProduct = (productId, quantity, price) => {
    console.log("available", availableProducts);

    if (quantity && price) {
      const existingProductIndex = addedProducts.findIndex(
        (item) => item.productId === productId
      );

      if (existingProductIndex === -1) {
        setAddedProducts((prev) => [
          ...prev,
          {
            matName: selectedProduct.matName,
            productId,
            quantity,
            price,
            total: quantity * price,
          },
        ]);

        // setAvailableProducts((prev) =>
        //   prev.filter((prod) => prod.matId !== productId)
        // );
      } else {
        // Update existing product quantity and total cost
        const updatedProducts = [...addedProducts];
        updatedProducts[existingProductIndex] = {
          ...updatedProducts[existingProductIndex],
          quantity: updatedProducts[existingProductIndex].quantity + quantity, // Increment quantity
          total:
            (updatedProducts[existingProductIndex].quantity + quantity) * price, // Recalculate total
        };
        setAddedProducts(updatedProducts);
      }

      // Update total cost
      setTotalCost((prev) => prev + quantity * price);

      console.log("added", addedProducts);
      setQuantity("");
    } else {
      alert("Please enter both quantity and price.");
    }
  };

  const handleSelectProduct = (id) => {
    console.log(id);
    const product = availableProducts.find(
      (prod) => prod.matId.toString() === id.toString()
    );

    console.log(product);
    setSelectedProduct(product); // Set selected product ID
    setSelectedPrice(product.price);
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

    onAdd(orderDetails);
    setSelectedSupplier("");
    setAvailableProducts([]);
    setAddedProducts([]);
    setTotalCost(0);
    setSelectedProduct([]);
    setSelectedPrice(0);
    setQuantity("");

    // Close modal after submission
    onClose();
  };

  const onCancel = () => {
    onClose();
    setSelectedSupplier("");
    setAvailableProducts([]);
    setAddedProducts([]);
    setTotalCost(0);
    setSelectedProduct([]);
    setSelectedPrice(0);
    setQuantity("");
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Order Products from Supplier</h2>
        <form onSubmit={handleSubmit}>
          {/* Supplier selection */}
          <label hidden={selectedSupplier}>Select Supplier:</label>
          <select
            hidden={selectedSupplier}
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
                value={selectedProduct.matId || ""}
                onChange={(e) => handleSelectProduct(e.target.value)}
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
                  const quantity =
                    document.getElementById("quantity-input").value;
                  const price = document.getElementById("price-input").value;

                  handleAddProduct(
                    selectedProduct.matId,
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
                    {item.matName} - ₱{item.price} x {item.quantity} = ₱
                    {item.total.toFixed(2)}
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
            <button type="submit" onClick={handleSubmit}>
              Place Order
            </button>
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupplyDeliveryModal;
