import React, { useEffect, useState } from "react";
import "../css/style.css";
import Header from "../BG/Customer/CustomerHeader";
import Sidebar from "../BG/Customer/CustomerSidebar";

function History() {
  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">history</div>
    </div>
  );
}

export default History;
