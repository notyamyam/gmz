import React, { useEffect, useState } from "react";
import "../css/style.css";
import Header from "../BG/Customer/CustomerHeader";
import Sidebar from "../BG/Customer/CustomerSidebar";
import style from "./Cancelled.module.css";
import apiUrl from "../ApiUrl/apiUrl";
import axios from "axios";

function CompletedOrders() {
  const userId = localStorage.getItem("id"); // get ID of customer.;

  const [completedArray, setCompletedArray] = useState([]); // Array of completed orders
  const [productsArr, setProdArr] = useState([]); // Array of product of an order

  const [viewOrderModal, setViewOrderModal] = useState(false);

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
    : completedArray.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(
    (searchQuery ? filteredOrders.length : completedArray.length) / itemsPerPage
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
        const timeReturn = item.time_return
          ? item.time_return.toLowerCase()
          : "";
        const date = item.date ? item.date.toLowerCase() : "";
        const totalSumPrice = item.total_sum_price
          ? item.total_sum_price.toString().toLowerCase()
          : "";

        return (
          orderId.includes(query) ||
          mop.includes(query) ||
          timeReturn.includes(query) ||
          date.includes(query) ||
          totalSumPrice.includes(query)
        );
      });
      setFilteredOrders(filtered);
    }
    setCurrentPage(1);
  };

  const openViewOrder = (products) => {
    setViewOrderModal(true);
    setProdArr(products);
  };

  const closeViewOrder = () => setViewOrderModal(false);

  const fetchCompletedOrders = async () => {
    try {
      const res = await axios.get(`${apiUrl}/completed_orders/${userId}`);

      if (Array.isArray(res.data.res)) {
        setCompletedArray(res.data.res);
        setItem(res.data.res);
      } else {
        setCompletedArray([]);
        setItem([]);
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    if (!searchQuery) {
      fetchCompletedOrders();
    }
  }, [completedArray, searchQuery]);

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-between">
          <div className="d-flex w-100 justify-content-start p-2">
            <h5>
              <strong>Completed Orders</strong>
            </h5>
          </div>

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
        </div>

        <div className="table-list">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Total Price</th>
                <th>Date Order</th>
                <th>Date Completed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {completedArray.length === 0 ? (
                <tr>
                  <td colSpan="6">NO ORDERS PLACED.</td>
                </tr>
              ) : (
                currentItems.map((completedArray, index) => (
                  <tr key={index}>
                    <td className="w-25 text-start align-middle">
                      {completedArray.order_id}{" "}
                      <strong>
                        <i>{completedArray.mop}</i>
                      </strong>
                    </td>
                    <td className="w-25 text-start align-middle">
                      {new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                      }).format(completedArray.total_sum_price)}
                    </td>
                    <td className="w-25 text-start align-middle">
                      {completedArray.date}
                    </td>

                    <td className="w-25 text-start align-middle">
                      {completedArray.time_return}
                    </td>

                    <td className="align-middle">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <button
                          className={`${style.buttonView} btn btn-primary d-flex align-items-center justify-content-center`}
                          onClick={() => {
                            openViewOrder(completedArray.products);
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

      {viewOrderModal && (
        <div className="modal-overlay">
          <div className={`modal-content d-flex justify-content-between w-100`}>
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Products</strong>
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
                    {productsArr?.length === 0 ? (
                      <tr>
                        <td colSpan="6">NO PRODUCTS FOUND.</td>
                      </tr>
                    ) : (
                      productsArr?.map((productsArr, index) => (
                        <tr key={index}>
                          <td className="w-25 text-start align-middle">
                            {productsArr.item_name}
                          </td>
                          <td className="w-25 text-start align-middle">
                            {productsArr.description}
                          </td>
                          <td className="align-middle">
                            {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(productsArr.price)}
                          </td>
                          <td className="align-middle">
                            {productsArr.quantity}
                          </td>
                          <td className="align-middle">
                            {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(productsArr.total_price)}
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
    </div>
  );
}

export default CompletedOrders;