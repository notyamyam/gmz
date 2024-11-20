import React, { useEffect, useState } from "react";
import "../css/style.css";
import Header from "../BG/Customer/CustomerHeader";
import Sidebar from "../BG/Customer/CustomerSidebar";

function Orders() {
  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="table-list">
          <table>
            <thead>
              <tr>
                <th>Order Name</th>
                <th>Status</th>
                <th>Where</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Orders;
