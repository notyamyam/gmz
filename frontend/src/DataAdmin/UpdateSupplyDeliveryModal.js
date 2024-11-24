import React, { useState, useEffect } from "react";
import "../css/AddItemModal.css";
import axios from "axios";
import apiUrl from "../ApiUrl/apiUrl";

const UpdateSupplyDeliveryModal = ({
  isOpen,
  onClose,
  onUpdate,
  suppliers,
  selectedPurchase,
}) => {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [addedProducts, setAddedProducts] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [productPrice, setProductPrice] = useState(0);

  useEffect(() => {
    if (selectedPurchase) {
      setAddedProducts(
        selectedPurchase.productDetails?.map((item) => ({
          productId: item.matId,
          matName: item.matName,
          price: item.price,
          quantity: item.quantity,
          total: item.itemTotal,
        }))
      );
      setTotalCost(selectedPurchase.totalCost);

      // Fetch supplier products
      fetchSupplierProducts(selectedPurchase.supplyId);
    }
  }, [selectedPurchase]);

  const fetchSupplierProducts = async (supplierId) => {
    try {
      const response = await axios.get(
        `${apiUrl}/getrawmaterials/${supplierId}`
      );
      setAvailableProducts(response.data);
    } catch (error) {
      console.error("Error fetching supplier products:", error);
    }
  };

  const handleSelectProduct = (e) => {
    const productId = e.target.value;
    console.log("=asd" , productId);
    const product = availableProducts.find(
      (p) => p.matId.toString() == productId
    );
    setSelectedProduct(productId);
    setProductPrice(product ? product.price : 0);
  };
  const handleAddProduct = (prod) => {

    if (!selectedProduct || !quantity || quantity <= 0) {
      alert("Please select a product and enter a valid quantity.");
      return;
    }
 
    const product = availableProducts.find(
      (p) => p.matId.toString() === selectedProduct
    );

    const existingIndex = addedProducts.findIndex(
      (item) =>
        item.productId == selectedProduct && item.matName === product.matName
    );

    

    if (existingIndex !== -1) {
      // Update existing product
      const updatedProducts = [...addedProducts];
      updatedProducts[existingIndex].quantity += parseInt(quantity);
      updatedProducts[existingIndex].total =
        updatedProducts[existingIndex].quantity * productPrice;

      setAddedProducts(updatedProducts);
    } else {
      // Add new product
      setAddedProducts((prev) => [
        ...prev,
        {
          productId: selectedProduct,
          matName: product.matName,
          price: productPrice,
          quantity: parseInt(quantity),
          total: parseInt(quantity) * productPrice,
        },
      ]);
    }

    // Update total cost
    setTotalCost((prev) => prev + parseInt(quantity) * productPrice);
    setQuantity(""); // Reset quantity input
  };

  const handleRemoveProduct = (e, productId) => {
    e.preventDefault();
  
    const removedProduct = addedProducts.find(
      (item) => item.productId === productId
    );
  
    if (removedProduct) {
      // Remove the product from the added products list
      const updatedProducts = addedProducts.filter(
        (item) => item.productId !== productId
      );
  
      // Recalculate the total cost
      const updatedTotalCost = updatedProducts.reduce(
        (acc, item) => acc + item.total,
        0
      );
      setTotalCost(updatedTotalCost);
  
      // Update addedProducts state
      setAddedProducts(updatedProducts);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedOrder = {
      orderId: selectedPurchase.orderId,
      supplyId: selectedPurchase.supplyId,
      totalCost,
      products: addedProducts,
    };

    onUpdate(e, updatedOrder);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Update Products for {selectedPurchase.supplyName}</h2>
        <form onSubmit={handleSubmit}>
          {/* Product selection */}
          <div className="product-selection">
            <label>Product:</label>
            <select value={selectedProduct} onChange={handleSelectProduct}>
              <option value="">Select a Product</option>
              {availableProducts.map((product) => (
                <option key={product.matId} value={product.matId}>
                  {product.matName}
                </option>
              ))}
            </select>

            <label>Quantity:</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            <label>Price:</label>
            <input type="number" value={productPrice} readOnly />

            <button type="button" onClick={(e) => handleAddProduct(selectedProduct)}>
              Add Product
            </button>
          </div>

          {/* Display added products */}
          <div className="added-products">
            <h4>Added Products:</h4>
            {addedProducts?.length === 0 ? (
              <p>No products added yet.</p>
            ) : (
              <ul>
                {addedProducts?.map((item, index) => (
                  <li key={index}>
                    {item.matName} - ₱{item.price} x {item.quantity} = ₱
                    {item.total.toFixed(2)}
                    <button
                      type="button"
                      onClick={(e) => handleRemoveProduct(e, item.productId)}
                      style={{ marginLeft: "10px" }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Total cost */}
          <h4>Total Cost: ₱{totalCost ? totalCost.toFixed(2) : 0.0}</h4>

          {/* Action buttons */}
          <div className="modal-actions">
            <button type="submit">Update Order</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateSupplyDeliveryModal;