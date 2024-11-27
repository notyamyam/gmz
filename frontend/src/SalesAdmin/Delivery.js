import React, { useEffect, useState } from "react";
import "../css/style.css";
import Header from "../BG/SalesAdminHeader";
import Sidebar from "../BG/SalesAdminSidebar";
import axios from "axios";
import apiUrl from "../ApiUrl/apiUrl";

function Delivery() {
  const [userId, setUserId] = useState("");
  const [orderId, setOrderId] = useState("");

  const [refNo, setRefNo] = useState("");
  const [totalPrice, setTotalPrice] = useState("");

  useEffect(() => {}, []);

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-start">
          <h4>
            <strong>Delivery</strong>
          </h4>
        </div>
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
                  <th>Plate</th>
                  <th>Rider Name</th>
                  <th>Deliver Location</th>
                  <th>Date Order (MM-DD-YYYY)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Delivery;
