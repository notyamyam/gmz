import React, { useEffect, useState } from "react";
import "../css/style.css";
import Header from "../BG/SalesAdminHeader";
import Sidebar from "../BG/SalesAdminSidebar";
import axios from "axios";
import moment from "moment";
import EditOrderModal from "./EditOrderModal";
import apiUrl from "../ApiUrl/apiUrl";

import style from "./Sales.module.css";

function Sales() {
  //modal for products
  const [modalShowProducts, setModalShowProducts] = useState(false);

  // array of sales
  const [item, setItem] = useState([]);
  const [salesArr, setSalesArr] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [prodArr, setProdArr] = useState([]);

  // Paginate the items based on currentPage
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = searchQuery
    ? filteredOrders.slice(indexOfFirstItem, indexOfLastItem)
    : salesArr.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(
    (searchQuery ? filteredOrders.length : salesArr.length) / itemsPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  //Search

  const fetchSales = async () => {
    try {
      const res = await axios.get(`${apiUrl}/sales_order`);
      console.log(res.data.res);
      if (Array.isArray(res.data.res)) {
        setItem(res.data.res);
        setSalesArr(res.data.res);
      } else {
        setSalesArr([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (!searchQuery) {
      fetchSales();
    }
  }, [salesArr, searchQuery]);

  const handleSeeProducts = async (products) => {
    setModalShowProducts(true);
    setProdArr(products);
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredOrders([]);
    } else {
      const filtered = item.filter(
        (item) =>
          item.order_id.toLowerCase().includes(query) ||
          item.mop.toLowerCase().includes(query) ||
          item.customer_name.toLowerCase().includes(query) ||
          item.customer_loc.toLowerCase().includes(query) ||
          item.vehicle_plate.toString().toLowerCase().includes(query) || // Include price field
          item.time_return.toString().toLowerCase().includes(query) || // Include totalQuantity field
          item.total_sum_price.toString().toLowerCase().includes(query)
      );
      setFilteredOrders(filtered);
    }
    setCurrentPage(1);
  };

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-start">
          <h4>
            <strong style={{ color: "gray" }}>Sales</strong>
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
          <div className="mt-1 d-flex justify-content-end w-100"></div>

          <div className="table-list overflow-hidden">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Location</th>
                  <th>Vehicle</th>
                  <th>Delivered</th>
                  <th>Total Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {salesArr?.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <strong>-</strong>
                    </td>
                  </tr>
                ) : (
                  currentItems?.map((salesArr, index) => (
                    <tr key={index}>
                      <td className="w-25 text-start align-middle">
                        {salesArr.order_id} - <strong>{salesArr.mop}</strong>
                      </td>
                      <td className="w-25 text-start align-middle">
                        {salesArr.customer_name}
                      </td>
                      <td className="w-25 text-start align-middle">
                        {salesArr.customer_loc}
                      </td>

                      <td className="text-start align-middle">
                        {salesArr.vehicle_plate}
                      </td>
                      <td className="w-25 text-start align-middle">
                        {salesArr.time_return}
                      </td>
                      <td className="w-25 align-middle">
                        {new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                        }).format(salesArr.total_sum_price)}
                      </td>

                      <td className="align-middle">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <button
                            className={` btn btn-primary d-flex align-items-center justify-content-center`}
                            onClick={() => {
                              handleSeeProducts(salesArr.products);
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

      {modalShowProducts && (
        <div className="modal-overlay">
          <div className={`${style["modalContent"]} d-flex flex-column w-100`}>
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Ordered Products</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={(e) => setModalShowProducts(false)}
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
    </div>
  );
}

export default Sales;
