import React, { useEffect, useState } from "react";
import "../css/style.css";
import Header from "../BG/Customer/CustomerHeader";
import Sidebar from "../BG/Customer/CustomerSidebar";

function Dashboard() {
  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="d-flex main-content">
        <div className="">dashboard</div>
      </div>
    </div>
  );
}

export default Dashboard;
