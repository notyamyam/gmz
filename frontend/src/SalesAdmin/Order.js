import React, { useEffect, useState } from "react";
import "../css/style.css";
import Header from "../BG/SalesAdminHeader";
import Sidebar from "../BG/SalesAdminSidebar";
import axios from "axios";
import moment from "moment";
import apiUrl from "../ApiUrl/apiUrl";

import style from "./Order.module.css";

// toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Order() {
  const [orders, setOrders] = useState([]);
  const [paginatedOrders, setPaginatedOrders] = useState([]); // Orders for the current page
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const ordersPerPage = 10; // You can adjust this number

  const [userId, setUserId] = useState("");
  const [orderId, setOrderId] = useState("");

  // for view modal ordered products (pending) fields
  const [refNo, setRefNo] = useState("");
  const [totalPrice, setTotalPrice] = useState("");

  const [pendingOrders, setPendingOrders] = useState([]);
  const [viewPendingModal, setViewPendingModal] = useState(false);
  const [viewPendingOrders, setViewPendingOrders] = useState([]);

  const [remarks, setRemarks] = useState("");
  const [reasonModal, setReasonModal] = useState(false);

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
    : pendingOrders.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(
    (searchQuery ? filteredOrders.length : pendingOrders.length) / itemsPerPage
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
        const customerName = item.customer_name
          ? item.customer_name.toLowerCase()
          : "";
        const customerLoc = item.customer_loc
          ? item.customer_loc.toLowerCase()
          : "";
        const date = item.date ? item.date.toLowerCase() : "";
        const totalSumPrice = item.total_sum_price
          ? item.total_sum_price.toString().toLowerCase()
          : "";

        return (
          orderId.includes(query) ||
          mop.includes(query) ||
          customerName.includes(query) ||
          customerLoc.includes(query) ||
          date.includes(query) ||
          totalSumPrice.includes(query)
        );
      });
      setFilteredOrders(filtered);
    }
    setCurrentPage(1);
  };

  const openViewPendingOrders = (data) => {
    setViewPendingOrders(data);
    setViewPendingModal(true);
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
      const res = await axios.get(`${apiUrl}/pending_Orders`);
      console.log(res.data.res);
      if (res.data.status === "success") {
        // Check if res.data.res is an array and set it to state
        if (Array.isArray(res.data.res)) {
          setPendingOrders(res.data.res);
          setItem(res.data.res);
        } else {
          console.log("Expected an array but got:", res.data.res);
          setPendingOrders([]); // If it's not an array, set an empty array
          setItem([]);
        }
      } else {
        console.log("PREPARING ORDERS: ", res.data.res);
      }
    } catch (error) {
      console.error("Error fetching orders:", error.message);
    }
  };

  // const fetchPendingOrderedProducts = async (userId, orderId) => {
  //   try {
  //     const res = await axios.post(`${apiUrl}/order_products/`, {
  //       userId,
  //       orderId,
  //     });

  //     if (res.data.status === "success") {
  //       setViewPendingOrders(res.data.res);
  //     } else {
  //       throw new Error("No order products found.");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  useEffect(() => {
    if (!searchQuery) {
      fetchPendingOrders();
    }
  }, [pendingOrders, searchQuery]);

  const handlePreparing = async (orderId) => {
    try {
      const res = await axios.post(`${apiUrl}/status_preparing/`, { orderId });

      console.log("res:", res);

      if (res.status === 400) {
        let errorMessage = res.data.message;

        // Replace <br> with newline characters to make it compatible with the alert box
        errorMessage = errorMessage.replace(/<br>/g, "\n");

        // Display the message using the native alert
        alert(errorMessage);
      } else if (res.data.status === "success") {
        toast.success("Order accepted, proceed to preparing.");
        setViewPendingModal(false);
        fetchPendingOrders();
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        let errorMessage = error.response.data.message;

        // Replace <br> tags with newline characters
        errorMessage = errorMessage.replace(/<br>/g, "\n");

        alert(errorMessage);
      } else {
        console.log("==>", error);
        alert("An error occurred while processing the order.");
      }
    }
  };

  const handleDeclineOrder = async () => {
    console.log("ORDER: ", orderId);
    console.log("REMARKS: ", remarks);

    try {
      const res = await axios.post(`${apiUrl}/decline_order/`, {
        orderId,
        remarks,
      });

      if (res.data.status === "success") {
        toast.success("Order declined successfully.");
        setRemarks("");
        setReasonModal(false);
        setViewPendingModal(false);
        fetchPendingOrders();
      } else {
        throw new Error("Declining order error.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-start">
          <h4>
            <strong style={{ color: "gray" }}>Orders</strong>
          </h4>
        </div>
        <div className="info">
          <div className="above-table">
            <div className="search-container1">
              <div className="search-wrapper">
                <label>
                  <i className="fa-solid fa-magnifying-glass search-icon"></i>
                </label>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search"
                  size="40"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>
          <div className="table-list overflow-hidden">
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
                    <td colSpan="6">
                      NO <strong>PENDING ORDERS</strong> PLACED.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((pendingOrders, index) => (
                    <tr key={index}>
                      <td className="text-start align-middle ">
                        <span className="me-2">{pendingOrders.order_id}</span>
                        <strong className="me-2">
                          <i>{pendingOrders.mop}</i>
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
                              openViewPendingOrders(pendingOrders.products);
                              setUserId(pendingOrders.user_id);
                              setOrderId(pendingOrders.order_id);
                              setRefNo(pendingOrders.ref_no);
                              setTotalPrice(pendingOrders.total_sum_price);
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
      </div>
      {/* VIEW PENDING PRODUCTS OF ORDERS */}
      {viewPendingModal && (
        <div className="modal-overlay">
          <div className={`${style["modalContent"]} d-flex flex-column w-100`}>
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
                <table className="table table-bordered">
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
                  <button
                    className="btn btn-danger"
                    onClick={() => setReasonModal(true)}
                  >
                    Decline
                  </button>
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
      {reasonModal && (
        <div className="modal-overlay">
          <div
            className={`${style["modalConfirm"]} d-flex flex-column justify-content-between w-100`}
          >
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Declining an Order</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={() => {
                  setReasonModal(false);
                }}
              ></button>
            </div>

            <div className="d-flex flex-column w-100">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDeclineOrder();
                }}
              >
                <span>Input reason to decline an order:</span>
                <input
                  type="text"
                  className="form-control"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  required
                />

                <div className="d-flex w-100 mt-2 justify-content-end">
                  <button className="btn btn-danger">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />;
    </div>
  );
}

export default Order;
