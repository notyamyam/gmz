import React, { useState, useEffect } from "react";
import "../css/AddItemModal.css"; // Your custom CSS for modal
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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSuppliers, setProductSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const [addedProducts, setAddedProducts] = useState([]);
  const [productPrice, setProductPrice] = useState(0);
  useEffect(() => {
    if (selectedPurchase) {
      console.log("asdas", selectedPurchase);
      setAddedProducts(
        selectedPurchase.rawMats?.map((item) => ({
          productId: item.matId,
          supplierId: item.supplierId,
          supplierName: item.supplyName,
          productName: item.matName,
          price: item.price,
          quantity: item.quantity,
          total: item.totalCost,
          itemStatus: item.status || 0,
        }))
      );
      setTotalCost(selectedPurchase.totalCost);
    }
  }, [selectedPurchase]);

  // Fetch products when the modal is opened
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

  const handleSelectProduct = async (productId) => {
    const product = availableProducts.find(
      (prod) => prod.matId.toString() === productId.toString()
    );
    setSelectedProduct(product);
    setQuantity("");

    try {
      const response = await axios.get(
        `${apiUrl}/getsuppliersforproduct/${productId}`
      );
      setProductSuppliers(response.data);
    } catch (error) {
      console.error("Error fetching suppliers for product:", error);
    }
  };

  const handleSelectSupplier = (supplierId) => {
    setSelectedSupplier(supplierId);
    const supplier = productSuppliers.find(
      (supplier) => supplier.supplyId === supplierId
    );
    setProductPrice(supplier?.price || 0); // Set price based on selected supplier
  };

  const handleAddProduct = () => {
    if (!selectedSupplier || !quantity || !selectedProduct) {
      alert("Please select a product, supplier, and quantity.");
      return;
    }

    const selectedSupplierData = productSuppliers.find(
      (supplier) => supplier.supplyId == selectedSupplier
    );

    if (!selectedSupplierData) {
      alert("Selected supplier is invalid.");
      return;
    }

    const productPrice = selectedSupplierData.price;
    const addedProductTotal = Number(quantity) * productPrice;

    // Check if the product and supplier already exist in addedProducts
    const existingProductIndex = addedProducts.findIndex(
      (item) =>
        item.productId == selectedProduct.matId &&
        item.supplierId == selectedSupplier &&
        item.itemStatus == 0
    );

    if (existingProductIndex !== -1) {
      // If product and supplier exist, update the quantity and total
      const updatedProducts = [...addedProducts];
      updatedProducts[existingProductIndex].quantity =
        updatedProducts[existingProductIndex].quantity + Number(quantity);
      updatedProducts[existingProductIndex].total =
        updatedProducts[existingProductIndex].quantity * productPrice;

      setAddedProducts(updatedProducts);
      setTotalCost(updatedProducts.reduce((acc, item) => acc + item.total, 0));
    } else {
      // If product and supplier do not exist, add new product
      const addedProduct = {
        productId: selectedProduct.matId,
        productName: selectedProduct.matName,
        supplierId: selectedSupplier,
        supplierName: selectedSupplierData.supplyName,
        quantity: Number(quantity),
        price: productPrice,
        total: addedProductTotal,
      };

      setAddedProducts((prevAddedProducts) => [
        ...prevAddedProducts,
        addedProduct,
      ]);

      setTotalCost((prevCost) => prevCost + addedProductTotal);
    }

    // Reset the selection for the next product
    setSelectedProduct(null);
    setSelectedSupplier(null);
    setQuantity("");
  };

  const handleRemoveProduct = (productId, supplierId) => {
    const updatedProducts = addedProducts.filter(
      (item) => item.productId !== productId || item.supplierId !== supplierId
    );
    setAddedProducts(updatedProducts);
    setTotalCost(updatedProducts.reduce((acc, item) => acc + item.total, 0));
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
          <label>Select Product:</label>
          <select
            value={selectedProduct ? selectedProduct.matId : ""}
            onChange={(e) => handleSelectProduct(e.target.value)}
            required={addedProducts?.length == 0}
          >
            <option value="">Select a Product</option>
            {availableProducts?.map((product) => (
              <option key={product.matId} value={product.matId}>
                {product.matName}
              </option>
            ))}
          </select>

          {/* Supplier selection (after selecting product) */}
          {selectedProduct && (
            <div>
              <label>Select Supplier for {selectedProduct.matName}:</label>
              <select
                value={selectedSupplier || ""}
                onChange={(e) => handleSelectSupplier(e.target.value)}
                required
              >
                <option value="">Select a Supplier</option>
                {productSuppliers?.map((supplier) => (
                  <option key={supplier.supplyId} value={supplier.supplyId}>
                    {supplier.supplyName} - ₱{supplier.price}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity input */}
          {selectedSupplier && (
            <div>
              <label>Quantity:</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                required
              />
            </div>
          )}

          {/* Button to add product */}
          <button
            type="button"
            onClick={handleAddProduct}
            disabled={!selectedSupplier || !quantity}
          >
            Add Product
          </button>

          {/* Display added products */}
          <div className="added-products">
            <h4>Added Products:</h4>
            <ul>
              {addedProducts?.map((item, index) => (
                <li key={index}>
                  {item.productName} from {item.supplierName} - ₱{item.price} x{" "}
                  {item.quantity} =
                  {new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                  }).format(item.total)}
                  <button
                    type="btn"
                    hidden={item.itemStatus == 1}
                    onClick={() =>
                      handleRemoveProduct(item.productId, item.supplierId)
                    }
                    style={{ marginLeft: "10px", color: "red" }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Display total cost */}
          <div>
            <strong>Total Cost: </strong>
            {new Intl.NumberFormat("en-PH", {
              style: "currency",
              currency: "PHP",
            }).format(totalCost)}
          </div>

          {/* Submit Button */}
          <div className="modal-footer">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={totalCost <= 0}>
              Update Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateSupplyDeliveryModal;
