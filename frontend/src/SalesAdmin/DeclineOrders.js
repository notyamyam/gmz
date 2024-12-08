import React, { useEffect, useState } from "react";
import "../css/style.css";
import Header from "../BG/SalesAdminHeader";
import Sidebar from "../BG/SalesAdminSidebar";
import axios from "axios";
import moment from "moment";
import apiUrl from "../ApiUrl/apiUrl";

import style from "./DeclineOrders.module.css";

// toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function DeclineOrders() {
  const [declineArr, setDeclineArr] = useState([]);
  const [prodArr, setProdArr] = useState([]);

  const [showProd, setShowProd] = useState(false);

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
    : declineArr.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(
    (searchQuery ? filteredOrders.length : declineArr.length) / itemsPerPage
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
        const remarks = item.remarks ? item.remarks.toLowerCase() : "";
        const date = item.date ? item.date.toLowerCase() : "";
        const totalSumPrice = item.total_sum_price
          ? item.total_sum_price.toString().toLowerCase()
          : "";

        return (
          orderId.includes(query) ||
          mop.includes(query) ||
          customerName.includes(query) ||
          customerLoc.includes(query) ||
          remarks.includes(query) ||
          date.includes(query) ||
          totalSumPrice.includes(query)
        );
      });
      setFilteredOrders(filtered);
    }
    setCurrentPage(1);
  };

  const fetchDecline = async () => {
    try {
      const res = await axios.get(`${apiUrl}/decline_orders`);
      console.log(res.data.res);
      if (res.data.status === "success") {
        if (Array.isArray(res.data.res)) {
          setDeclineArr(res.data.res);
          setItem(res.data.res);
        } else {
          setDeclineArr([]); // If it's not an array, set an empty array
        }
      } else {
        console.log("DECLINE ORDERS: ", res.data.res);
      }
    } catch (error) {
      console.error("Error fetching orders:", error.message);
    }
  };

  const handleShowProd = async (products) => {
    setShowProd(true);
    setProdArr(products);
  };

  useEffect(() => {
    if (!searchQuery) {
      fetchDecline();
    }
  }, [declineArr, searchQuery]);

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-start">
          <h4>
            <strong style={{ color: "gray" }}>Decline Orders</strong>
          </h4>
        </div>

        <div className="info">
          <div className="above-table">
            <div className="above-table-wrapper"></div>
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

          <div className="table-list">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Customer Loc</th>
                  <th>Total Price</th>
                  <th>Date Order</th>
                  <th>Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {declineArr?.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <strong>NO SALES</strong> TODAY.
                    </td>
                  </tr>
                ) : (
                  currentItems?.map((declineArr, index) => (
                    <tr key={index}>
                      <td className="w-25 text-start align-middle">
                        {declineArr.order_id} -{" "}
                        <strong>{declineArr.mop}</strong>
                      </td>
                      <td className="w-25 text-start align-middle">
                        {declineArr.customer_name}
                      </td>
                      <td className="w-25 text-start align-middle">
                        {declineArr.customer_loc}
                      </td>

                      <td className="text-start align-middle">
                        {new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                        }).format(declineArr.total_sum_price)}
                      </td>
                      <td className="w-25 text-start align-middle">
                        {declineArr.date}
                      </td>
                      <td className="w-25 text-start align-middle">
                        <strong>{declineArr.remarks}</strong>
                      </td>

                      <td className="align-middle">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <button
                            className={` btn btn-primary d-flex align-items-center justify-content-center`}
                            onClick={() => {
                              handleShowProd(declineArr.products);
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
      {showProd && (
        <div className="modal-overlay">
          <div className={`${style["modalContent"]} d-flex flex-column w-100`}>
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Products</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={(e) => setShowProd(false)}
              ></button>
            </div>

            <div className="overflow-hidden">
              <div className={`table-list w-100`}>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Description</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prodArr?.length === 0 ? (
                      <tr>
                        <td colSpan="6">NO PRODUCTS FOUND.</td>
                      </tr>
                    ) : (
                      prodArr?.map((prodArr, index) => (
                        <tr key={index}>
                          <td className="w-25 text-start align-middle">
                            {prodArr.item_name}
                          </td>
                          <td className="w-25 text-start align-middle">
                            {prodArr.description}
                          </td>
                          <td className="align-middle">
                            {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(prodArr.price)}
                          </td>
                          <td className="w-25 text-start align-middle">
                            {prodArr.quantity}
                          </td>
                          <td className="align-middle">
                            {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(prodArr.total_price)}
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
      <ToastContainer />;
    </div>
  );
}

export default DeclineOrders;
