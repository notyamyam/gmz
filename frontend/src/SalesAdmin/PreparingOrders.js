import React, { useEffect, useState } from "react";
import "../css/style.css";
import Header from "../BG/SalesAdminHeader";
import Sidebar from "../BG/SalesAdminSidebar";
import axios from "axios";
import moment from "moment";
import EditOrderModal from "./EditOrderModal";
import apiUrl from "../ApiUrl/apiUrl";

function PreparingOrders() {
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]); // New state to hold items
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [preparingOrders, setPreparingOrders] = useState([]);

  // Fetch orders from the backend
  const fetchOrdersByStatus = async () => {
    try {
      const response = await axios.get(`${apiUrl}/preparingOrders`);
      setOrders(response.data); // Use response.data directly
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Fetch items from the backend
  const fetchItems = async () => {
    try {
      const response = await axios.get(`${apiUrl}/items`);
      setItems(response.data); // Use response.data directly
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const fetchPreparingOrders = async () => {
    try {
      const res = await axios.get(`${apiUrl}/preparingOrders`);
      console.log("fetch pending orders: ", res.data.res);
      setPreparingOrders(res.data.res);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          console.error("No pending orders found:", error.response.data.res);
          setPreparingOrders([]);
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

  useEffect(() => {
    fetchPreparingOrders();
    
    fetchOrdersByStatus();
    fetchItems(); // Fetch items on component mount
  }, []);

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setEditModalOpen(true);
  };

  const handleUpdateOrder = async (updatedOrder) => {
    try {
      await axios.put(`${apiUrl}/orders/${updatedOrder.orderId}`, updatedOrder);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === updatedOrder.orderId ? updatedOrder : order
        )
      );
      setEditModalOpen(false);
      fetchOrdersByStatus();
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  // Function to get item name by itemId
  const getItemNameById = (itemId) => {
    const item = items.find((item) => item.itemId === itemId);
    return item ? item.itemName : "Unknown Item"; // Return a default value if not found
  };

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="page-title">Preparing Orders</div>
        <div className="info">
          <div className="above-table">
            <div className="above-table-wrapper">
              <button className="btn" id="sortButton">
                <i className="fa-solid fa-sort"></i> Sort
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
              <div>
                <button id="searchButton" className="btn">
                  Search
                </button>
              </div>
            </div>
          </div>
          <div className="t-head">
            <table className="table-head">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
            </table>
          </div>
          <div className="table-list">
            <table>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={order.orderId}>
                    <td>{index + 1}</td>
                    <td>{order.customerName}</td>
                    <td>{getItemNameById(order.itemId)}</td>{" "}
                    {/* Get item name */}
                    <td>{order.quantity}</td>
                    <td>
                      <button className="btn">
                        <i className="fa-solid fa-check"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                {preparingOrders?.length === 0 ? (
                  <tr>
                    <td colSpan="6">NO PENDING ORDERS PLACED.</td>
                  </tr>
                ) : (
                    preparingOrders?.map((preparingOrders, index) => (
                    <tr key={index}>
                      <td className="text-start align-middle ">
                        <span className="me-2">{preparingOrders.order_id}</span>
                        <strong className="me-2">
                          <i>{preparingOrders.mop}</i>
                        </strong>
                        <strong className="me-2">
                          <i>{preparingOrders.status}</i>
                        </strong>
                        <strong>
                          <i>{preparingOrders.ref_no}</i>
                        </strong>
                      </td>
                      <td className="text-start align-middle ">
                        <span className="me-2">
                          {preparingOrders.customer_name}
                        </span>
                      </td>
                      <td className="text-start align-middle">
                        {preparingOrders.customer_loc}
                      </td>
                      <td className="text-start align-middle">
                        {preparingOrders.date}
                      </td>

                      <td className="text-start align-middle">
                        {new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                        }).format(preparingOrders.total_sum_price)}
                      </td>

                      <td className="align-middle">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <button
                            className={` btn btn-primary d-flex align-items-center justify-content-center`}
                            onClick={() => {
                            //   openViewPendingOrders(
                            //     preparingOrders.customer_id,
                            //     preparingOrders.order_id,
                            //     preparingOrders.ref_no,
                            //     preparingOrders.total_sum_price
                            //   );
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
      {isEditModalOpen && (
        <EditOrderModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          onUpdate={handleUpdateOrder}
          order={selectedOrder}
        />
      )}
    </div>
  );
}

export default PreparingOrders;
