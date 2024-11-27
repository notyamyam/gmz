import React, { useEffect, useState, useRef } from "react";
import "../css/style.css";
import Header from "../BG/SystemAdminHeader";
import Sidebar from "../BG/SystemAdminSidebar";
import axios from "axios";
import apiUrl from "../ApiUrl/apiUrl";

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [supplierDeliveries, setSupplierDeliveries] = useState([]);
  const [production, setProduction] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [pinnedCard, setPinnedCard] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const dashboardRef = useRef(null);

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    // Fetch documents
    axios
      .get(`${apiUrl}/documentsdashboard`)
      .then((response) => setDocuments(response.data))
      .catch((error) => console.error("Error fetching documents:", error));

    // Fetch customer orders
    axios
      .get(`${apiUrl}/customer-orders`)
      .then((response) => setOrders(response.data))
      .catch((error) => console.error("Error fetching orders:", error));

    // Fetch out-of-stock items
    axios
      .get(`${apiUrl}/out-of-stock-items`)
      .then((response) => setOutOfStockItems(response.data))
      .catch((error) => console.error("Error fetching out-of-stock items:", error));

    // Fetch raw materials
    axios
      .get(`${apiUrl}/rawmatsdashboard`)
      .then((response) => setRawMaterials(response.data))
      .catch((error) => console.error("Error fetching raw materials:", error));

    // Fetch supplier deliveries
    axios
      .get(`${apiUrl}/supDeliDashboard`)
      .then((response) => setSupplierDeliveries(response.data))
      .catch((error) =>
        console.error("Error fetching supplier deliveries:", error)
      );

    // Fetch production data
    axios
      .get(`${apiUrl}/productionDashboard`)
      .then((response) => setProduction(response.data))
      .catch((error) => console.error("Error fetching production:", error));
  }, []);

  const details = {
    Documents: documents,
    Orders: orders,
    "Out of Stock": outOfStockItems,
    "Raw Materials": rawMaterials,
    "Supplier Deliveries": supplierDeliveries,
    Production: production,
  };

  const gradientColors = [
    "linear-gradient(135deg, #4facfe, #00f2fe)", // Blue gradient
    "linear-gradient(135deg, #43e97b, #38f9d7)", // Green gradient
    "linear-gradient(135deg, #fa709a, #fee140)", // Orange gradient
    "linear-gradient(135deg, #fa700a, #fee140)", 
  ];

  const handleRightClick = (event, cardName) => {
    event.preventDefault();
    setPinnedCard(cardName);
    setTooltipPosition({ top: event.clientY + window.scrollY, left: event.clientX });
    setCurrentPage(1);
  };

  const handleMouseEnter = (event, cardName) => {
    if (!pinnedCard) {
      setHoveredCard(cardName);
      setTooltipPosition({ top: event.clientY + window.scrollY, left: event.clientX });
      setCurrentPage(1);
    }
  };

  const handleMouseLeave = () => {
    if (!pinnedCard) setHoveredCard(null);
  };

  const handleClickOutside = (event) => {
    if (dashboardRef.current && !dashboardRef.current.contains(event.target)) {
      setPinnedCard(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const handlePageChange = (direction, dataLength) => {
    if (direction === "next" && currentPage * ITEMS_PER_PAGE < dataLength) {
      setCurrentPage((prevPage) => prevPage + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content" ref={dashboardRef}>
        <div className="p-4">
          <h1 className="page-title">DASHBOARD</h1>
          <div className="row mt-4">
            {/* Cards */}
            {Object.keys(details).map((key, index) => (
              <div
                key={index}
                className="col-md-4 mb-4"
                onMouseEnter={(event) => handleMouseEnter(event, key)}
                onMouseLeave={handleMouseLeave}
                onContextMenu={(event) => handleRightClick(event, key)}
                style={{ height: "200px" }}
              >
                <div
                  className="card text-white mb-3"
                  style={{
                    height: "100%",
                    borderRadius: "15px",
                    background: gradientColors[index % gradientColors.length],
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div className="card-body d-flex flex-column justify-content-center align-items-center">
                    <h5 className="card-title text-uppercase">{key}</h5>
                    <p className="card-text fs-3 fw-bold">{details[key].length}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tooltip Table */}
          {(hoveredCard || pinnedCard) && (
            <div
              className="tooltip-table"
              style={{
                position: "absolute",
                top: tooltipPosition.top,
                left: tooltipPosition.left,
                zIndex: 10,
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                padding: "10px",
                maxWidth: "400px",
                overflow: "auto",
              }}
            >
              <h6>{pinnedCard || hoveredCard} Details</h6>
              <table className="table table-sm">
                <thead>
                  <tr>
                    {Object.keys(details[pinnedCard || hoveredCard]?.[0] || {}).map((key) => (
                      <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(details[pinnedCard || hoveredCard] || []).map((item, index) => (
                    <tr key={index}>
                      {Object.values(item).map((value, idx) => (
                        <td key={idx}>
                          {typeof value === "object" ? (
                            JSON.stringify(value, null, 2) // Render object as string
                          ) : (
                            value
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination-controls">
                <button
                  onClick={() =>
                    handlePageChange("prev", details[pinnedCard || hoveredCard].length)
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    handlePageChange("next", details[pinnedCard || hoveredCard].length)
                  }
                  disabled={currentPage * ITEMS_PER_PAGE >= details[pinnedCard || hoveredCard].length}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
