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
          itemStatus: item.itemStatus || 0,
        }))
      );
      setTotalCost(selectedPurchase.totalCost);
    }
  }, [selectedPurchase]);

  // Use a separate useEffect to trigger fetching supplier products after addedProducts is updated
  useEffect(() => {
    if (addedProducts?.length > 0) {
      const supplierId = selectedPurchase?.supplyId;
      fetchSupplierProducts(supplierId);
    }

    console.log(totalCost);
  }, [addedProducts, selectedPurchase?.supplyId]); // Trigger when addedProducts or supplyId changes

  const fetchSupplierProducts = async (supplierId) => {
    try {
      const response = await axios.get(
        `${apiUrl}/getrawmaterials/${supplierId}`
      );

      // Filter out products with `status === 1` in the addedProducts
      const updatedProducts = response.data
        .map((product) => {
          const addedProduct = addedProducts?.find(
            (item) => item.productId === product.matId
          );

          // If the product exists in addedProducts with status === 1, exclude it
          if (addedProduct && addedProduct.itemStatus === 1) {
            return null; // Exclude this product
          }

          // Otherwise, include the product and annotate if it exists in addedProducts
          return {
            ...product,
            itemStatus: addedProduct ? addedProduct.itemStatus : null, // Annotate with itemStatus
            quantity: addedProduct ? addedProduct.quantity : 0, // Annotate with quantity
          };
        })
        .filter((product) => product !== null); // Remove excluded products

      setAvailableProducts(updatedProducts); // Update the state with filtered products
    } catch (error) {
      console.error("Error fetching supplier products:", error);
    }
  };

  const handleSelectProduct = (e) => {
    const productId = e.target.value;

    const product = availableProducts.find(
      (p) => p.matId.toString() == productId
    );
    setSelectedProduct(productId);
    setProductPrice(product ? product.price : 0);
  };
  const handleAddProduct = (prod) => {
    if (!selectedProduct || !quantity || quantity <= 0 || isNaN(quantity)) {
      alert("Please select a product and enter a valid quantity.");
      return;
    }

    const product = availableProducts.find(
      (p) => p.matId.toString() === selectedProduct
    );

    if (!product) {
      alert("Product not found.");
      return;
    }

    const parsedQuantity = parseInt(quantity);
    const parsedPrice = parseFloat(productPrice);

    const existingIndex = addedProducts.findIndex(
      (item) =>
        item.productId == selectedProduct && item.matName === product.matName
    );

    if (existingIndex !== -1) {
      // Update existing product
      const updatedProducts = [...addedProducts];
      updatedProducts[existingIndex].quantity += parsedQuantity;
      updatedProducts[existingIndex].total =
        updatedProducts[existingIndex].quantity * parsedPrice;

      setAddedProducts(updatedProducts);
    } else {
      // Add new product
      setAddedProducts((prev) => [
        ...prev,
        {
          productId: selectedProduct,
          matName: product.matName,
          price: parsedPrice,
          quantity: parsedQuantity,
          total: parsedQuantity * parsedPrice,
        },
      ]);
    }

    // Update total cost
    setTotalCost((prev) => {
      const newTotalCost = prev + parsedQuantity * parsedPrice;
      return !isNaN(newTotalCost) ? newTotalCost : 0;
    });

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
    setQuantity("");
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
              onChange={(e) => {
                const newValue = e.target.value;
                if (newValue >= 0 || newValue === "") {
                  setQuantity(newValue);
                }
              }}
            />

            <label>Price:</label>
            <input type="number" value={productPrice} readOnly />

            <button
              type="button"
              onClick={(e) => handleAddProduct(selectedProduct)}
            >
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
                    {item.matName} - ₱{item.price} x {item.quantity} =
                    {new Intl.NumberFormat("en-PH", {
                      style: "currency",
                      currency: "PHP",
                    }).format(item.total)}
                    <button
                      hidden={item.itemStatus == 1}
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
          <h4>
            Total Cost:{" "}
            {new Intl.NumberFormat("en-PH", {
              style: "currency",
              currency: "PHP",
            }).format(totalCost || 0)}
          </h4>

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
