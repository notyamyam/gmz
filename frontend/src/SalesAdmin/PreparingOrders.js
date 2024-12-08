import React, { useEffect, useState, useCallback } from "react";
import "../css/style.css";
import Header from "../BG/SalesAdminHeader";
import Sidebar from "../BG/SalesAdminSidebar";
import axios from "axios";
import moment from "moment";
import EditOrderModal from "./EditOrderModal";
import apiUrl from "../ApiUrl/apiUrl";

import style from "./PreparingOrders.module.css";

// toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PreparingOrders() {
  const [orders, setOrders] = useState([]);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  //modal viewing of products per order
  const [viewPreparingModal, setViewPreparingModal] = useState(false);

  const [viewPreparingOrders, setViewPreparingOrders] = useState([]);

  const [userId, setUserId] = useState("");
  const [orderId, setOrderId] = useState("");

  const [refNo, setRefNo] = useState("");
  const [totalPrice, setTotalPrice] = useState("");

  // Paginate the items based on currentPage
  const [item, setItem] = useState([]);
  const [preparingOrders, setPreparingOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const itemsPerPage = 8;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // If search is not empty, show filtered orders, else show preparing orders
  const currentItems = searchQuery
    ? filteredOrders.slice(indexOfFirstItem, indexOfLastItem)
    : preparingOrders.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(
    (searchQuery ? filteredOrders.length : preparingOrders.length) /
      itemsPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(event.target.value);

    if (query === "") {
      setFilteredOrders([]); // Reset to show all data
    } else {
      const filtered = item.filter((order) => {
        const orderId = order.order_id?.toLowerCase() || "";
        const mop = order.mop?.toLowerCase() || "";
        const customerName = order.customer_name?.toLowerCase() || "";
        const customerLoc = order.customer_loc?.toLowerCase() || "";
        const date = order.date?.toLowerCase() || "";
        const totalSumPrice = order.total_sum_price
          ? order.total_sum_price.toString().toLowerCase()
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

  const openViewPreparingOrders = (data) => {
    setViewPreparingModal(true);
    setViewPreparingOrders(data);
  };

  const closeViewPreparingOrders = () => {
    setViewPreparingModal(false);
  };

  // Fetch orders preparing from the backend
  const fetchPreparing = async () => {
    try {
      const res = await axios.get(`${apiUrl}/preparing_Orders`);

      if (res.data.status === "success") {
        // Check if res.data.res is an array and set it to state
        if (Array.isArray(res.data.res)) {
          setPreparingOrders(res.data.res);
          setItem(res.data.res);
        } else {
          console.log("Expected an array but got:", res.data.res);
          setPreparingOrders([]);
          setItem([]);
        }
      } else {
        console.log("PREPARING ORDERS: ", res.data.res);
      }
    } catch (error) {
      // setPreparingOrders([]);
      console.error("Error fetching orders:", error);
    }
  };

  // const fetchPreparingOrderedProducts = async (userId, orderId) => {
  //   try {
  //     const res = await axios.post(`${apiUrl}/order_products/`, {
  //       userId,
  //       orderId,
  //     });

  //     if (res.data.status === "success") {
  //       console.log("view pending orders: ", res.data.res);
  //       setViewPreparingOrders(res.data.res);
  //     } else {
  //       throw new Error("No order products found.");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // Fetch items from the backend

  useEffect(() => {
    if (!searchQuery) {
      fetchPreparing();
    }
  }, [preparingOrders, searchQuery]);
  //preparingOrders

  const handlePrepared = async (orderId) => {
    try {
      const res = await axios.post(`${apiUrl}/status_prepared/`, {
        orderId,
      });
      console.log("asds=>", res);
      if (res.data.status == "success") {
        toast.success("Proceed to prepared, to assign rider.");
        setViewPreparingModal(false);
        fetchPreparing();
      } else {
        throw new Error("No order products found.");
      }
    } catch (error) {
      console.log("===================>", error);
    }
  };

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-start">
          <h4>
            <strong style={{ color: "gray" }}>Preparing Orders</strong>
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
          {/* <div className="t-head">
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
          </div> */}
          {/* <div className="table-list">
            <table>
              <tbody>
               
              </tbody>
            </table>
          </div> */}

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
                    <td colSpan="6">
                      NO <strong>PREPARING</strong> ORDERS PLACED.
                    </td>
                  </tr>
                ) : (
                  currentItems?.map((preparingOrders, index) => (
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
                              openViewPreparingOrders(preparingOrders.products);
                              setUserId(preparingOrders.user_id);
                              setOrderId(preparingOrders.order_id);
                              setRefNo(preparingOrders.ref_no);
                              setTotalPrice(preparingOrders.total_sum_price);
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
      {viewPreparingModal && (
        <div className="modal-overlay">
          <div
            className={`${style["modalContent"]} d-flex flex-column justify-content-between w-100`}
          >
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Ordered Products</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={closeViewPreparingOrders}
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
                    {viewPreparingOrders?.length === 0 ? (
                      <tr>
                        <td colSpan="6">NO PRODUCTS FOUND.</td>
                      </tr>
                    ) : (
                      viewPreparingOrders?.map((item, index) => (
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
                    className="btn btn-success"
                    onClick={() => {
                      handlePrepared(orderId);
                    }}
                  >
                    <i className="fa fa-check "></i>
                    <span className="ms-1">Mark as Prepared </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />;
    </div>
  );
}

export default PreparingOrders;
