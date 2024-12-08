import React, { useEffect, useState } from "react";
import "../css/style.css";

import Header from "../BG/Customer/CustomerHeader";
import Sidebar from "../BG/Customer/CustomerSidebar";
import axios from "axios";
import apiUrl from "../ApiUrl/apiUrl";
import { faVolumeHigh } from "@fortawesome/free-solid-svg-icons";
import style from "./Orders.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Orders() {
  const [showAddToCart, setAddToCart] = useState(false);
  const [showMyCart, setMyCart] = useState(false);

  const [showStockLabel, setStockLabel] = useState(false);

  const openAddToCartModal = () => {
    console.log("items: ", items);
    setAddToCart(true);
  };
  const closeAddToCartModal = () => {
    resetFields();
  };

  const openViewMyCart = () => setMyCart(true);
  const closeViewMyCart = () => setMyCart(false);

  const openCancelModal = (order_id) => {
    setCancelModal(true);
    setOrderId(order_id);
  };
  const closeCancelModal = () => setCancelModal(false);

  const openViewOrder = (order_id) => {
    setViewOrderModal(true);
    setOrderId(order_id);
  };
  const closeViewOrder = () => setViewOrderModal(false);

  const [items, setItems] = useState([]); // Store fetched items
  const [cartItems, setCartItems] = useState([]); // Store fetch (My Cart)
  const [orderProd, setOrderProd] = useState([]); // Fetch orders by customer_id
  const [viewOrder, setViewOrder] = useState([]); // Fetch products of order
  const [mopArray, setMopArray] = useState([]); // Fetch MOP

  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [itemName, setItemName] = useState("");
  const [qty, setQty] = useState("1"); // from database
  const [totalPrice, setTotalPrice] = useState(""); // from quantity input
  const [showFileInput, setShowFileInput] = useState(false);

  const [quantity, setQuantity] = useState(0);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerLoc, setCustomerLoc] = useState("");

  const [payment, setPayment] = useState(""); // MOP (cash, gcash);
  const [refNo, setRefNo] = useState("");

  const [cancelModal, setCancelModal] = useState(false);
  const [viewOrderModal, setViewOrderModal] = useState(false);
  const [showMOP, setShowMOP] = useState(false); // Fetch products of order

  const userId = localStorage.getItem("id"); // get ID of customer.;

  const [orderId, setOrderId] = useState("");

  //calculate total price
  const totalSum = cartItems.reduce((sum, item) => sum + item.total_price, 0);

  // Paginate the items based on currentPage
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [item, setItem] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = searchQuery
    ? filteredOrders.slice(indexOfFirstItem, indexOfLastItem)
    : orderProd.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(
    (searchQuery ? filteredOrders.length : orderProd.length) / itemsPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(event.target.value);
    if (query === "") {
      setFilteredOrders([]); // Reset to show all data
    } else {
      const filtered = item.filter((item) => {
        const orderId = item.order_id ? item.order_id.toLowerCase() : "";
        const mop = item.mop ? item.mop.toLowerCase() : "";

        const status = item.status ? item.status.toLowerCase() : "";
        const date = item.date ? item.date.toLowerCase() : "";
        const totalSumPrice = item.total_sum_price
          ? item.total_sum_price.toString().toLowerCase()
          : "";

        return (
          orderId.includes(query) ||
          mop.includes(query) ||
          status.includes(query) ||
          date.includes(query) ||
          totalSumPrice.includes(query)
        );
      });
      setFilteredOrders(filtered);
    }
    setCurrentPage(1);
  };

  const fetchCustomerName = async () => {
    if (!userId) {
      console.log("User ID not found in localStorage.");
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
      console.log(err.message);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api-items`);
      console.log(res);
      if (res.data.status === "success") {
        setItems(res.data.res);
      } else {
        throw new Error("No items found");
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchMyCart = async () => {
    try {
      const res = await axios.get(`${apiUrl}/mycart/${userId}`);
      if (res.data.status === "success") {
        setCartItems(res.data.res);
      } else {
        throw new Error("No products found.");
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${apiUrl}/orders_customer/${userId}`);

      if (Array.isArray(res.data.res)) {
        setOrderProd(res.data.res);
      } else {
        setOrderProd([]);
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchMOP = async () => {
    try {
      const res = await axios.get(`${apiUrl}/fetchmop/`);
      if (res.data.status === "success") {
        setMopArray(res.data.res); // Populate the MOP array with data
      } else {
        throw new Error("No modes of payment found.");
      }
    } catch (err) {
      console.error("Error fetching modes of payment:", err.message);
    }
  };

  useEffect(() => {
    if (!searchQuery) {
      fetchCustomerName();
      fetchOrders();
      fetchItems();
      fetchMyCart();
    }
    // fetchOrderedProducts();
    fetchMOP();
  }, [orderProd, searchQuery]);

  const removeProdCart = async (item_id) => {
    try {
      const res = await axios.delete(`${apiUrl}/remove-prod-cart`, {
        data: { item_id, user_id: userId },
      });
      fetchMyCart();
    } catch (error) {
      console.log(error);
    }
  };

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
        toast.success(response.data.message);
        fetchMyCart();
      } else {
        alert("Failed to place order.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order.", error);
    }

    resetFields();
  };

  const handleCheckOut = async () => {
    try {
      const res = await axios.post(`${apiUrl}/checkout_cus`, {
        userId,
        payment,
        refNo,
        cartItems,
        totalSum,
        customerId,
        customerName,
        customerLoc,
      });

      if (res.status === 200) {
        toast.success("Order placed successfully.");
        setCartItems([]); // Clear cart
        setShowMOP(false); // Hide MOP modal
        setMyCart(false); // Hide the cart
        fetchOrders(); // Fetch updated orders
        setRefNo("");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message); // Show message if refNo is already used
      } else {
        alert("Checkout failed. Please try again.");
      }
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const remarks = prompt(
        "Please enter your remarks for cancelling the order:"
      );

      // Validate if the input is empty or null

      if (!remarks || remarks.trim() === "") {
        alert("Remarks cannot be empty. Please try again.");
        return; // Exit the function if validation fails
      }
      const res = await axios.post(`${apiUrl}/cancelling_order`, {
        orderId,
        remarks,
      });

      if (res.status === 200) {
        toast.success("Order cancelled successfully.");
        fetchOrders();
        closeCancelModal();
      }
    } catch (error) {
      console.log(error);
      alert("Failed to cancel the order. Please try again.");
    }
  };

  // HANDLE PAYMENT IN MOP
  const handlePaymentChange = (e) => {
    setRefNo("");
    const selectedValue = e.target.value;

    setPayment(selectedValue);

    // Find the selected mop item in mopArray
    const selectedMop = mopArray.find(
      (mopItem) => mopItem.mop === selectedValue
    );

    // Show file input if attach_file === "1"
    if (selectedMop.attach_file == "1") {
      console.log("true");
      setShowFileInput(true);
    } else {
      console.log("false");
      setShowFileInput(false);
    }
  };

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-between p-2">
          <div className="d-flex w-100 justify-content-start">
            <h5>
              <strong>Orders</strong>
            </h5>
          </div>
        </div>

        <div className="w-100 d-flex justify-content-between">
          <div className="search-wrapper">
            <label>
              <i className="fa-solid fa-magnifying-glass search-icon"></i>
            </label>
            <input
              type="text"
              className="search-input"
              placeholder="Search"
              size="20"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="d-flex w-100 justify-content-end align-items-center gap-2">
            <button
              className={`${style.btnTopButton} btn d-flex align-items-center justify-content-center`}
              onClick={openAddToCartModal}
            >
              <i className="fa-solid fa-add"></i>
            </button>
            <button
              className={`${style.btnTopButton} btn d-flex align-items-center justify-content-center`}
              onClick={openViewMyCart}
            >
              <i class="fa fa-shopping-cart"></i>
            </button>
          </div>
        </div>

        <div className="table-list">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Total Price</th>
                <th>Date Order</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orderProd?.length === 0 ? (
                <tr>
                  <td colSpan="6">NO ORDERS PLACED.</td>
                </tr>
              ) : (
                currentItems?.map((product, index) => (
                  <tr key={index}>
                    <td className="w-25 text-start align-middle ">
                      <span className="me-2">{product.order_id}</span>
                      <strong>
                        <i>{product.mop}</i>
                      </strong>
                    </td>
                    <td className="w-25 text-start align-middle">
                      {new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                      }).format(product.total_sum_price)}
                    </td>
                    <td className="align-middle">{product.date}</td>
                    <td className="align-middle">
                      <span
                        className={`${
                          style[
                            `badge-${(product.status === "Ready"
                              ? "Departing"
                              : product.status
                            ).toLowerCase()}`
                          ]
                        }`}
                      >
                        <strong>
                          {product.status === "Ready"
                            ? "Departing"
                            : product.status}
                        </strong>
                      </span>
                    </td>

                    <td className="align-middle">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        {product.status === "Pending" && (
                          <button
                            className={`${style.buttonRemove} btn btn-danger d-flex align-items-center justify-content-center`}
                            onClick={() => openCancelModal(product.order_id)}
                          >
                            <i
                              className="fa fa-ban"
                              style={{ fontSize: "15px" }}
                            ></i>
                          </button>
                        )}

                        <button
                          className={`${style.buttonView} btn btn-primary d-flex align-items-center justify-content-center`}
                          onClick={() => {
                            openViewOrder(product.order_id);
                            setViewOrder(product.products);
                          }}
                        >
                          <i
                            className="fa fa-eye"
                            style={{ fontSize: "15px" }}
                          ></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      {/* Modal for add to cart product*/}
      {showAddToCart && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5 class="modal-title">
                <strong>Add to Cart</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
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
                  {items?.map((item) => (
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
                      value={new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                      }).format(price)}
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
                <p>
                  Total Price:{" "}
                  <strong>
                    {new Intl.NumberFormat("en-PH", {
                      style: "currency",
                      currency: "PHP",
                    }).format(totalPrice)}
                  </strong>
                </p>
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
          <div className={`${style.modal75} modal-content`}>
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5 class="modal-title">
                <strong>My Cart</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={closeViewMyCart}
              ></button>
            </div>
            <div className="overflow-hidden">
              <div className={`${style.div75} table-list w-100`}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Item name</th>
                      <th>Description</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.length === 0 ? (
                      <tr>
                        <td colSpan="6">NO PRODUCTS IN CART.</td>
                      </tr>
                    ) : (
                      cartItems?.map((item, index) => (
                        <tr key={index}>
                          <td className="w-25 text-start align-middle">
                            {item.item_name}
                          </td>
                          <td className="w-25 text-start align-middle">
                            {item.description}
                          </td>
                          <td className="align-middle">
                            {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(item.price)}
                          </td>
                          <td className="align-middle">{item.qty}</td>
                          <td className="align-middle">
                            {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(item.total_price)}
                          </td>

                          <td className="align-middle">
                            <div className="d-flex align-items-center justify-content-center">
                              <button
                                className={`${style.buttonRemove} btn btn-danger d-flex align-items-center justify-content-center`}
                                onClick={() => removeProdCart(item.item_id)}
                              >
                                <i
                                  className="fa fa-trash"
                                  style={{ fontSize: "15px" }}
                                ></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="d-flex justify-content-between w-100 mt-2">
              <div className="d-flex gap-2">
                <h3>Total:</h3>

                <h3>
                  {new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                  }).format(totalSum)}
                </h3>
              </div>
              <button
                className={`${style.btnDefault}`}
                onClick={() => {
                  if (cartItems.length === 0) {
                    alert(
                      "No products in the cart! Please add products to proceed."
                    );
                  } else {
                    setShowMOP(true); // Proceed to show the MOP if cart is not empty
                  }
                }}
              >
                Check out
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal for cancelling a order*/}
      {cancelModal && (
        <div className="modal-overlay">
          <div
            className={`modal-content d-flex w-25 flex-column justify-content-center align-items-center`}
          >
            <div className="d-flex justify-content-center w-100 flex-column">
              <h6>
                <strong>You're about to cancel your order.</strong>
              </h6>
              <span>Are you sure you want to cancel your order?</span>
            </div>

            <div className="d-flex w-100 justify-content-end gap-2">
              <button
                className="btn btn-light"
                onClick={() => {
                  closeCancelModal();
                }}
              >
                Discard
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  handleCancelOrder(orderId);
                }}
              >
                Cancel it
              </button>
            </div>
          </div>
        </div>
      )}
      {viewOrderModal && (
        <div className="modal-overlay">
          <div className={`modal-content d-flex justify-content-between w-100`}>
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Ordered Products</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={closeViewOrder}
              ></button>
            </div>
            <div className="overflow-hidden">
              <div className={`${style.div75} table-list w-100`}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Item name</th>
                      <th>Description</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewOrder?.length === 0 ? (
                      <tr>
                        <td colSpan="6">NO PRODUCTS FOUND.</td>
                      </tr>
                    ) : (
                      viewOrder?.map((item, index) => (
                        <tr key={index}>
                          <td className="w-25 text-start align-middle">
                            {item.item_name}
                          </td>
                          <td className="w-25 text-start align-middle">
                            {item.description}
                          </td>
                          <td className="align-middle">
                            {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(item.price)}
                          </td>
                          <td className="align-middle">{item.quantity}</td>
                          <td className="align-middle">
                            {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(item.total_price)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Showing mode of payment modal */}
      {showMOP && (
        <div className="modal-overlay">
          <form
            className={`modal-content d-flex w-25 flex-column justify-content-center align-items-center`}
            onSubmit={(e) => {
              e.preventDefault(); // Prevent default form submission
              handleCheckOut(); // Call your checkout handler
            }}
          >
            <div className="d-flex justify-content-center w-100 flex-column">
              <span>
                Choose your <strong>mode of payment:</strong>
              </span>

              <select
                value={payment}
                onChange={handlePaymentChange}
                required
                className="form-select mt-2"
              >
                <option value="" disabled>
                  Select payment method
                </option>
                {mopArray.map((mopItem, index) => (
                  <option key={index} value={mopItem.mop}>
                    {mopItem.mop}
                  </option>
                ))}
              </select>

              {/* Conditionally render "Insert file" */}
              {showFileInput && (
                <div className="mt-3">
                  <span>Enter reference number: </span>
                  <input
                    className="form-control mt-2"
                    type="text"
                    required
                    value={refNo}
                    onChange={(e) => setRefNo(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="d-flex w-100 justify-content-end gap-2 mt-3">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setShowMOP(false);
                  setPayment("");
                  setShowFileInput(false);
                  setRefNo("");
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-danger">
                Place Order
              </button>
            </div>
          </form>
        </div>
      )}
      <ToastContainer />;
    </div>
  );
}

export default Orders;