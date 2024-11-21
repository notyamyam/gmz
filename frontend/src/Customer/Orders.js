import React, { useEffect, useState } from "react";
import "../css/style.css";
import Header from "../BG/Customer/CustomerHeader";
import Sidebar from "../BG/Customer/CustomerSidebar";
import axios from "axios";
import apiUrl from "../ApiUrl/apiUrl";
import { faVolumeHigh } from "@fortawesome/free-solid-svg-icons";

function Orders() {
  const [showAddToCart, setAddToCart] = useState(false);
  const [showMyCart, setMyCart] = useState(false);

  const [showStockLabel, setStockLabel] = useState(false);

  const openAddToCartModal = () => setAddToCart(true);
  const closeAddToCartModal = () => {
    resetFields();
  };

  const openViewMyCart = () => setMyCart(true);
  const closeViewMyCart = () => setMyCart(false);

  const [items, setItems] = useState([]); // Store fetched items
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [itemName, setItemName] = useState("");

  const [qty, setQty] = useState("1"); // from database
  const [totalPrice, setTotalPrice] = useState(""); // from quantity input

  const [quantity, setQuantity] = useState(0);

  const [selectedProduct, setSelectedProduct] = useState("");

  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerLoc, setCustomerLoc] = useState("");
  const [loading, setLoading] = useState(true); // Optional: to show loading state
  const [error, setError] = useState(null); // Optional: to handle errors

  useEffect(() => {
    const fetchCustomerName = async () => {
      const userId = localStorage.getItem("id"); // Retrieve user ID from localStorage

      if (!userId) {
        setError("User ID not found in localStorage.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${apiUrl}/api-get-customer-info/${userId}`
        ); // API call
        if (response.data.status === "success") {
          setCustomerId(userId);
          setCustomerName(response.data.res.name || "");
          setCustomerLoc(response.data.res.location || "");
        } else {
          throw new Error("Failed to fetch customer name");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerName();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api-items`);
        if (response.data.status === "success") {
          setItems(response.data.res);
        } else {
          throw new Error("No items found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const resetFields = () => {
    setAddToCart(false);

    setPrice("");
    setQty(null);
    setSelectedProduct("");
    setStockLabel(false);
    setTotalPrice("");
    setDescription("");
    setQuantity(0);
  };

  const handleSelectItems = (e) => {
    const selectedId = e.target.value;
    setSelectedProduct(selectedId);
    setStockLabel(true);

    // Find the selected product's price
    const selectedItem = items.find((item) => item.itemId == selectedId);

    if (selectedItem) {
      setPrice(selectedItem.price);
      setQty(selectedItem.quantity);
      setDescription(selectedItem.description);
      setItemName(selectedItem.itemName);
      if (selectedItem.quantity === 0) {
        setQuantity(0); // If qty is 0, set quantity to 0
        setTotalPrice(0);
      } else {
        setQuantity(1); // If qty is not 0, set quantity to 1
        setTotalPrice(selectedItem.price);
      }
    } else {
      setPrice(""); // Reset if no product is selected
      setQty("");
      setDescription(""); // Reset if no product is selected
      setItemName("");
      setQuantity(0);
      setStockLabel(false);
      setTotalPrice(0);
    }
  };

  const handlePriceXQty = (e) => {
    const value = parseInt(e.target.value);
    const total_price = price * value;

    if (qty == 0) {
      setQty("0");
      setQuantity(0);
    } else {
      if (value >= 1 && value <= qty) {
        setQuantity(value); // Update state if within range
        setTotalPrice(total_price);
      } else if (value < 1) {
        setQuantity(0); // Reset to minimum if below 1
        setTotalPrice(total_price);
      } else if (value > qty) {
        setQuantity(0); // Reset to maximum if above maxQty
        setTotalPrice(total_price);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const insertCartData = {
      selectedProduct,
      itemName,
      price,
      description,
      quantity,
      totalPrice,
      customerId,
      customerName,
      customerLoc,
    };

    try {
      const response = await axios.post(
        `${apiUrl}/api-insert-to-cart`,
        insertCartData
      );
      if (response.status === 200) {
        console.log(response);
        alert(response.data.message);
        // alert("Order placed successfully!");
      } else {
        alert("Failed to place order.");
      }
    } catch (error) {
      console.log("INSERTING DATA : ", insertCartData);

      console.error("Error placing order:", error);
      alert("Error placing order.", error);
    }

    resetFields();
  };

  if (loading) {
    return <p>Loading...</p>; // Loading state
  }

  if (error) {
    return <p>Error: {error}</p>; // Error state
  }

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-between">
          <button className="" onClick={openAddToCartModal}>
            <i className="fa-solid fa-add"></i> Add
          </button>
          <button className="btn btn-success" onClick={openViewMyCart}>
            <i className="fa-solid fa-add"></i> My Cart
          </button>
        </div>

        <div className="table-list">
          <table className="table">
            <thead>
              <tr>
                <th>Item name</th>
                <th>Price</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>

      {/* Modal for add to cart product*/}
      {showAddToCart && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5 class="modal-title">Add to Cart</h5>
              <button
                type="button"
                className="btn-close"
                onClick={closeAddToCartModal}
              ></button>
            </div>
            <form className="mt-2" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                readOnly
                hidden
              />
              <input
                type="text"
                placeholder="Location"
                value={customerLoc}
                readOnly
                hidden
              />

              <div className="">
                <select
                  required
                  value={selectedProduct}
                  onChange={handleSelectItems}
                >
                  <option value="">Select a Product</option>
                  {items.map((item) => (
                    <option key={item.itemId} value={item.itemId}>
                      {item.itemName}
                    </option>
                  ))}
                </select>
                <span
                  className="d-flex justify-content-end"
                  style={{
                    color: "#939393",
                    fontStyle: "italic",
                    fontSize: "13px",
                  }}
                >
                  {description}
                </span>

                <div className="d-flex justify-content-between gap-1 w-100 mt-4">
                  <div className="d-flex flex-column w-100">
                    <h6>Price:</h6>
                    <input
                      type="text"
                      className="w-100"
                      placeholder="Price"
                      value={price}
                      readOnly
                    />
                  </div>

                  <div className="d-flex flex-column w-100">
                    <div className="d-flex justify-content-between w-100">
                      <h6>Quantity:</h6>
                      {showStockLabel && (
                        <span
                          className="fs-6"
                          style={{ color: "#939393", fontSize: "20px" }}
                        >
                          Avail. Stock: {qty}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      className="w-100"
                      placeholder="Quantity"
                      min="1"
                      max={qty}
                      onChange={handlePriceXQty}
                      required
                      disabled={qty === 0}
                      value={quantity}
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end w-100"></div>

              <div className="total-price d-flex w-100 justify-content-end">
                <p>Total Price: ₱{totalPrice}</p>
              </div>

              <button
                type="submit"
                disabled={qty === 0}
                style={{
                  cursor: qty === 0 ? "not-allowed" : "pointer",
                  opacity: qty === 0 ? 0.6 : 1,
                }}
              >
                Add to Cart
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FOR VIEW CART */}
      {showMyCart && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5 class="modal-title">My Cart</h5>
              <button
                type="button"
                className="btn-close"
                onClick={closeViewMyCart}
              ></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;