import React, { useEffect, useState } from "react";
import "../css/style.css";
import Header from "../BG/SalesAdminHeader";
import Sidebar from "../BG/SalesAdminSidebar";
import axios from "axios";
import moment from "moment";
import AddOrderModal from "./AddOrderModal";
import EditOrderModal from "./EditOrderModal";
import apiUrl from "../ApiUrl/apiUrl";

function Order() {
  const [orders, setOrders] = useState([]);
  const [paginatedOrders, setPaginatedOrders] = useState([]); // Orders for the current page
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10; // You can adjust this number

  const [userId, setUserId] = useState("");
  const [orderId, setOrderId] = useState("");

  // for view modal ordered products (pending) fields
  const [refNo, setRefNo] = useState("");
  const [totalPrice, setTotalPrice] = useState("");

  const [pendingOrders, setPendingOrders] = useState([]);
  const [viewPendingModal, setViewPendingModal] = useState(false);
  const [viewPendingOrders, setViewPendingOrders] = useState([]);

  const openViewPendingOrders = (user_id, order_id, ref_no, total_price) => {
    setViewPendingModal(true);
    setUserId(user_id);
    setOrderId(order_id);
    setRefNo(ref_no);
    setTotalPrice(total_price);
    fetchPendingOrderedProducts(user_id, order_id, ref_no, total_price);
  };
  const closeViewPendingOrders = () => setViewPendingModal(false);

  // Fetch orders from the backend
  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${apiUrl}/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const res = await axios.get(`${apiUrl}/pendingOrders`);
      console.log("fetch pending orders: ", res.data.res);
      setPendingOrders(res.data.res);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          console.error("No pending orders found:", error.response.data.res);
          setPendingOrders([]);
        } else {
          console.error(
            `Error fetching orders: ${error.response.status} - ${error.response.data.message}`
          );
          alert("An error occurred while fetching orders.");
        }
      } else {
        // Handle network or other errors
        console.error("Error fetching orders:", error.message);
        alert("Unable to fetch pending orders. Please try again later.");
      }
    }
  };

  const fetchPendingOrderedProducts = async (userId, orderId) => {
    try {
      const res = await axios.post(`${apiUrl}/pending_order_products/`, {
        userId,
        orderId,
      });

      if (res.data.status === "success") {
        console.log("view pending orders: ", res.data.res);
        setViewPendingOrders(res.data.res);
      } else {
        throw new Error("No order products found.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchPendingOrders();
    fetchPendingOrderedProducts();
  }, []);

  useEffect(() => {
    // Paginate orders when orders or currentPage change
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    setPaginatedOrders(currentOrders);
  }, [orders, currentPage]);

  const handlePreparing = async (orderId) => {
    try {
      const res = await axios.post(`${apiUrl}/status_preparing/`, {
        orderId,
      });

      if (res.data.status === "success") {
        alert("Order is preparing.");
        setViewPendingModal(false);
        fetchPendingOrders();
      } else {
        throw new Error("No order products found.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddOrder = async (newOrder, orderProductsData) => {
    try {
      // Combine order details and products into one request
      const response = await axios.post(`${apiUrl}/orders`, {
        ...newOrder,
        orderProducts: orderProductsData,
      });

      console.log("Order added successfully:", response.data);
      fetchOrders();
    } catch (error) {
      console.error("Error adding order:", error);
    }
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setEditModalOpen(true);
  };

  const handleUpdateOrder = async (updatedOrder) => {
    try {
      // Send the merged data in the PUT request
      await axios.put(`${apiUrl}/orders/${updatedOrder.orderId}`, updatedOrder);

      // Update the local orders state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === updatedOrder.orderId ? updatedOrder : order
        )
      );

      // Close the modal and refresh the orders list
      setEditModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(`${apiUrl}/orders/${orderId}`);
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.orderId !== orderId)
        );
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(orders.length / ordersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="page-title">Orders</div>
        <div className="info">
          <div className="above-table">
            <div className="above-table-wrapper">
              <button className="btn" onClick={() => setAddModalOpen(true)}>
                <i className="fa-solid fa-add"></i> Add
              </button>
            </div>
            <div className="search-container1">
              <div className="search-wrapper">
                <label>
                  <i className="fa-solid fa-magnifying-glass search-icon"></i>
                </label>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search..."
                  size="40"
                />
              </div>
            </div>
          </div>
          <div className="t-head">
            <table className="table-head">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Order Date</th>
                  <th>Location</th>
                  <th>Mode of Payment</th>
                  <th>Payment Status</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
            </table>
          </div>
          <div className="table-list">
            <table>
              <tbody>
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center" }}>
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order, index) => {
                    const itemNames = order.itemNames
                      ? order.itemNames.split(", ")
                      : [];
                    const itemQuantities = order.quantities
                      ? order.quantities.split(", ")
                      : [];
                    const batch = order.quantities
                      ? order.quantities.split(", ")
                      : [];
                    const itemsArray = itemNames.map((name, i) => ({
                      itemName: name,
                      quantity: itemQuantities[i] || "Unknown quantity",
                      batch: batch,
                    }));

                    return (
                      <tr key={order.orderId}>
                        <td>{index + 1}</td>
                        <td>{order.customerName}</td>
                        <td>{moment(order.date).format("MM-DD-YYYY")}</td>
                        <td>{order.location}</td>
                        <td>{order.modeOfPayment}</td>
                        <td>{order.paymentStatus}</td>
                        <td>{order.status}</td>
                        <td>
                          {itemsArray.length > 0 ? (
                            <ul>
                              {itemsArray.map((item, i) => (
                                <li key={i}>
                                  {item.itemName} - Batch#{item.batch} (
                                  {item.quantity})
                                </li>
                              ))}
                            </ul>
                          ) : (
                            "No items listed"
                          )}
                        </td>
                        <td>₱{order.price}</td>
                        <td className="button-container1">
                          <button
                            className="edit-btn"
                            onClick={() => handleEditOrder(order)}
                          >
                            <i className="fa-solid fa-edit"></i>
                          </button>
                          <button
                            className="btn"
                            onClick={() => handleDeleteOrder(order.orderId)}
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="pagination">
            <button
              className="btn"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <i className="fa-solid fa-chevron-left"></i> Prev
            </button>
            <span>
              Page {currentPage} of {Math.ceil(orders.length / ordersPerPage)}
            </span>
            <button
              className="btn"
              onClick={handleNextPage}
              disabled={
                currentPage === Math.ceil(orders.length / ordersPerPage)
              }
            >
              Next <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          <div className="table-list">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Location</th>
                  <th>Date Order (MM-DD-YYYY)</th>
                  <th>Total Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6">NO PENDING ORDERS PLACED.</td>
                  </tr>
                ) : (
                  pendingOrders.map((pendingOrders, index) => (
                    <tr key={index}>
                      <td className="text-start align-middle ">
                        <span className="me-2">{pendingOrders.order_id}</span>
                        <strong className="me-2">
                          <i>{pendingOrders.mop}</i>
                        </strong>
                        <strong className="me-2">
                          <i>{pendingOrders.status}</i>
                        </strong>
                        <strong>
                          <i>{pendingOrders.ref_no}</i>
                        </strong>
                      </td>
                      <td className="text-start align-middle ">
                        <span className="me-2">
                          {pendingOrders.customer_name}
                        </span>
                      </td>
                      <td className="text-start align-middle">
                        {pendingOrders.customer_loc}
                      </td>
                      <td className="text-start align-middle">
                        {pendingOrders.date}
                      </td>

                      <td className="text-start align-middle">
                        {new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                        }).format(pendingOrders.total_sum_price)}
                      </td>

                      <td className="align-middle">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <button
                            className={` btn btn-primary d-flex align-items-center justify-content-center`}
                            onClick={() => {
                              openViewPendingOrders(
                                pendingOrders.customer_id,
                                pendingOrders.order_id,
                                pendingOrders.ref_no,
                                pendingOrders.total_sum_price
                              );
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
        </div>
      </div>
      <AddOrderModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddOrder}
      />
      {isEditModalOpen && (
        <EditOrderModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          onUpdate={handleUpdateOrder}
          order={selectedOrder}
        />
      )}

      {/* VIEW PENDING PRODUCTS OF ORDERS */}
      {viewPendingModal && (
        <div className="modal-overlay">
          <div className={`modal-content d-flex justify-content-between w-100`}>
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Ordered Products</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={closeViewPendingOrders}
              ></button>
            </div>
            <div className="d-flex w-100 justify-content-between mt-2">
              <h6>{refNo ? `Reference No: ${refNo}` : "COD"}</h6>
              <h6>
                Total Price:{" "}
                <strong>
                  {" "}
                  {new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                  }).format(totalPrice)}
                </strong>
              </h6>
            </div>
            <div className="overflow-hidden">
              <div className={`table-list w-100`}>
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
                    {viewPendingOrders?.length === 0 ? (
                      <tr>
                        <td colSpan="6">NO PRODUCTS FOUND.</td>
                      </tr>
                    ) : (
                      viewPendingOrders?.map((item, index) => (
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

                <div className="d-flex w-100 justify-content-end gap-2">
                  <button className="btn btn-danger">Decline</button>
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      handlePreparing(orderId);
                    }}
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Order;
