import React, { useEffect, useState, useRef } from "react";
import "../css/style.css";
import Header from "../BG/SystemAdminHeader";
import Sidebar from "../BG/SystemAdminSidebar";
import axios from "axios";
import apiUrl from "../ApiUrl/apiUrl";
import ReactApexChart from "react-apexcharts";
import style from "./Dashboard.module.css";
function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [supplierDeliveries, setSupplierDeliveries] = useState([]);
  const [production, setProduction] = useState([]);
  const [chartData, setChartData] = useState([]); // Store chart data
  const [chartDataMostSoldProduct, setChartDataMostSoldProduct] = useState([]);
  const [chartDataLeastSoldProduct, setChartDataLeastSoldProduct] = useState(
    []
  );
  const [hoveredCard, setHoveredCard] = useState(null);
  const [pinnedCard, setPinnedCard] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const dashboardRef = useRef(null);

  const [chartUrl, setChartUrl] = useState("");
  const [selectedRange, setSelectedRange] = useState("week"); // default to 'week'
  const [rangeData, setRangeData] = useState([]);

  const [modalShowProducts, setModalShowProducts] = useState(false);

  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [salesDashboard, setSalesDashboard] = useState([]);
  const [prodArr, setProdArr] = useState([]);

  const [salesToday, setSalesToday] = useState(""); // Use null initially to handle loading state
  const [salesMonth, setSalesMonth] = useState(""); // Use null initially to handle loading state

  const ITEMS_PER_PAGE = 5;

  const fetchSalesData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/sales/current-year`);
      setSalesData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  const fetchSalesDashboard = async () => {
    try {
      const res = await axios.get(`${apiUrl}/sales_dashboard`);
      //   console.log(res.data.res);
      if (Array.isArray(res.data.res)) {
        setSalesDashboard(res.data.res);
      } else {
        setSalesDashboard([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchSalesToday = async () => {
    try {
      const res = await axios.get(`${apiUrl}/expensethismonth/`);
      // console.log(res.data.daily_total_sales);
      if (res.status === 200 && res.data.expense != null) {
        setSalesToday(res.data.expense);
      } else {
        setSalesToday("No expense");
      }
    } catch (error) {
      console.error("Error fetching daily sales:", error);
      setSalesToday("Error fetching sales data."); // Handle error case
    }
  };

  const fetchSalesMonth = async () => {
    try {
      const res = await axios.get(`${apiUrl}/sales_month/`);
      // console.log(res.data.thisMonth_total_sales);
      if (res.status === 200 && res.data.thisMonth_total_sales != null) {
        setSalesMonth(res.data.thisMonth_total_sales); // Set the daily sales data to state
      } else {
        setSalesMonth("No sales this month.");
      }
    } catch (error) {
      console.error("Error fetching daily sales:", error);
      setSalesMonth("Error fetching sales data."); // Handle error case
    }
  };


  const fetch = async () => {
    await axios
      .get(`${apiUrl}/documentsdashboard`)
      .then((response) => setDocuments(response.data))
      .catch((error) => console.error("Error fetching documents:", error));

    // Fetch customer orders
    await axios
      .get(`${apiUrl}/customer-orders`)
      .then((response) => setOrders(response.data))
      .catch((error) => console.error("Error fetching orders:", error));

    try {
      const response = await axios.get(`${apiUrl}/dashboard`);
      console.log("res =>", response.data);
      const {
        inventory,
        rawMaterials,
        supplierDeliveries,
        production,
        productionMaterials,
        mostSoldProducts,
        leastSoldProducts,
      } = response.data;
      setOutOfStockItems(inventory);
      setRawMaterials(rawMaterials);
      setSupplierDeliveries(supplierDeliveries);
      setProduction(production);
      setChartData(productionMaterials);
      setChartDataMostSoldProduct(mostSoldProducts);
      setChartDataLeastSoldProduct(leastSoldProducts);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };
  useEffect(() => {
    fetch();
    fetchSalesData();
    fetchSalesDashboard();
    fetchSalesToday();
    fetchSalesMonth();
  }, []);

  const chartOptions = {
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chartData?.map(
        (item) => `${item.matName} (${item.supplyName})`
      ), // Material Name (Supplier Name)
    },
    yaxis: {
      title: {
        text: "Total Ordered Quantity",
      },
    },
    fill: {
      opacity: 1,
      colors: ["#FF0000"],
    },
    title: {
      text: "Most Ordered Materials",
      align: "center",
      style: {
        fontSize: "16px",
        fontWeight: "bold",
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      floating: true,
    },
  };

  const chartSeries = [
    {
      name: "Total Ordered",
      data: chartData?.map((item) => item.totalOrdered), // Total Ordered Quantity
    },
  ];

  const chartOptionsMostSoldProduct = {
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chartDataMostSoldProduct?.map((item) => `${item.item_name}`), // Material Name (Supplier Name)
    },
    yaxis: {
      title: {
        text: "Total Sales",
      },
    },
    fill: {
      opacity: 1,
      colors: ["#FF0000"],
    },
    title: {
      text: "Most Ordered Products",
      align: "center",
      style: {
        fontSize: "16px",
        fontWeight: "bold",
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      floating: true,
    },
  };

  const chartSeriesMostSoldProduct = [
    {
      name: "Total Sales",
      data: chartDataMostSoldProduct?.map((item) => item.TOTALSALES), // Total Ordered Quantity
    },
  ];

  const chartOptionsLeastSoldProduct = {
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chartDataLeastSoldProduct?.map((item) => `${item.item_name}`), // Material Name (Supplier Name)
    },
    yaxis: {
      title: {
        text: "Total Sales",
      },
    },
    fill: {
      opacity: 1,
      colors: ["#FF0000"],
    },
    title: {
      text: "Least Ordered Products",
      align: "center",
      style: {
        fontSize: "16px",
        fontWeight: "bold",
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      floating: true,
    },
  };

  const chartSeriesLeastSoldProduct = [
    {
      name: "Total Sales",
      data: chartDataLeastSoldProduct?.map((item) => item.TOTALSALES), // Total Ordered Quantity
    },
  ];

  const details = {
    Documents: documents,
    Orders: orders,
    "Critical Stock": outOfStockItems,
    "Critical Raw Materials": rawMaterials,
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
    setTooltipPosition({
      top: event.clientY + window.scrollY,
      left: event.clientX,
    });
    setCurrentPage(1);
  };

  const handleMouseEnter = (event, cardName) => {
    if (!pinnedCard) {
      setHoveredCard(cardName);
      setTooltipPosition({
        top: event.clientY + window.scrollY,
        left: event.clientX,
      });
      setCurrentPage(1);
    }
  };

  const handleMouseLeave = (e) => {
    if (!pinnedCard) {
      setPinnedCard(null);
      setHoveredCard(null);
    }
  };

  const handleClickOutside = (event) => {
    if (dashboardRef.current && !dashboardRef.current.contains(event.target)) {
      setPinnedCard(null);
      setHoveredCard(null); // Reset hoveredCard state as well
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
    return data?.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const handlePageChange = (direction, dataLength) => {
    if (direction === "next" && currentPage * ITEMS_PER_PAGE < dataLength) {
      setCurrentPage((prevPage) => prevPage + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleSeeProducts = async (products) => {
    setModalShowProducts(true);
    setProdArr(products);
  };

  // Function to handle range change
  const handleRangeChange = (event) => {
    setSelectedRange(event.target.value);
  };

  const chartOptionsSales = {
    chart: {
      id: "sales-bar-chart",
      type: "bar",
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    title: {
      text: "Monthly Sales for Current Year",
      align: "center",
    },
    colors: ["#ff2828"],
    tooltip: {
      y: {
        formatter: (value) => {
          return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
          }).format(value); // Format the value for tooltip
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => {
        return new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(value); // Format the value for bar labels
      },
      style: {
        colors: ["#fff"], // Color of the label text
        fontSize: "12px", // Font size of the label
      },
      offsetY: -10, // Vertical offset for label (adjust this for padding)
      dropShadow: {
        enabled: true,
        top: 2,
        left: 2,
        blur: 3,
        color: "#000", // Background color simulation
        opacity: 1,
      },
    },
  };

  const chartSeriesSales = [
    {
      name: "Total Sales",
      data: salesData,
    },
  ];


  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content" ref={dashboardRef}>
        <div className="p-4">
          <div className="d-flex w-100 justify-content-start ">
            <h4>
              <strong style={{ color: "gray" }}>Dashboard</strong>
            </h4>
          </div>
          <div className="row mt-4">
            {/* Cards */}
            {Object.keys(details)?.map((key, index) => (
              <div
                key={index}
                className="col-md-4 mb-4"
                onMouseEnter={(event) => handleMouseEnter(event, key)}
                onMouseLeave={handleMouseLeave}
                onContextMenu={(event) => handleRightClick(event, key)}
                style={{ height: "200px", cursor: "pointer" }}
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
                    <p className="card-text fs-3 fw-bold">
                      {details[key].length}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
       
          <div className="col-md-12 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Sales Current Year</h5>
                <ReactApexChart
                  options={chartOptionsSales}
                  series={chartSeriesSales}
                  type="bar"
                  height={350}
                />
              </div>
            </div>
          </div>

          <div className="d-flex flex-column w-100 gap-2 mb-4">
          <div className="d-flex w-100 gap-2">
            <div className="d-flex flex-column justify-content-between w-25 gap-2">
              <div
                className={`${style.box} h-100 d-flex w-100 p-2 flex-column justify-content-between`}
              >
                <h5 style={{ color: "gray" }}>Supplier expense <span><h6>(this month)</h6></span></h5>
                {salesToday ? (
                  salesToday === "No expense this month." ? (
                    <h4
                      className="d-flex w-100 justify-content-end"
                      style={{ color: "gray" }}
                    >
                      <strong>No expense this month.</strong>
                    </h4>
                  ) : (
                    <h2 className="d-flex justify-content-end">
                      {new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                      }).format(salesToday)}
                    </h2>
                  )
                ) : (
                  <span>Loading...</span> // Show loading state while fetching data
                )}
              </div>
              <div
                className={`${style.box} h-100 d-flex w-100 p-2 flex-column justify-content-between`}
              >
                <h5 style={{ color: "gray" }}>This Month Sales</h5>
                {salesMonth ? (
                  salesMonth === "No sales this month." ? (
                    <h4 style={{ color: "gray" }}>No sales this month.</h4>
                  ) : (
                    <h2 className="d-flex justify-content-end">
                      <strong>
                        {new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                        }).format(salesMonth)}
                      </strong>
                    </h2>
                  )
                ) : (
                  <p>Loading...</p> // Show loading state while fetching data
                )}
              </div>
            </div>
            <div className={`${style.chart} d-flex w-75 `}>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <ReactApexChart
                  options={chartOptions}
                  series={chartSeries}
                  type="bar"
                  height={350}
                  className="d-flex w-100 p-2"
                />
              )}
            </div>
          </div>

     
        </div>

          <div className="col-md-12 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Most Ordered Products</h5>
                <ReactApexChart
                  options={chartOptionsMostSoldProduct}
                  series={chartSeriesMostSoldProduct}
                  type="bar"
                  height={350}
                />
              </div>
            </div>
          </div>

          <div className="col-md-12 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Least Ordered Products</h5>
                <ReactApexChart
                  options={chartOptionsLeastSoldProduct}
                  series={chartSeriesLeastSoldProduct}
                  type="bar"
                  height={350}
                />
              </div>
            </div>
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
                    {Object.keys(
                      details[pinnedCard || hoveredCard]?.[0] || {}
                    )?.map((key) => (
                      <th key={key}>
                        {key.charAt(0).toUpperCase() + key?.slice(1)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(
                    details[pinnedCard || hoveredCard] || []
                  )?.map((item, index) => (
                    <tr key={index}>
                      {Object.values(item)?.map((value, idx) => (
                        <td key={idx}>
                          {typeof value === "object"
                            ? JSON.stringify(value, null, 2) // Render object as string
                            : value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination-controls">
                <button
                  onClick={() =>
                    handlePageChange(
                      "prev",
                      details[pinnedCard || hoveredCard].length
                    )
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    handlePageChange(
                      "next",
                      details[pinnedCard || hoveredCard].length
                    )
                  }
                  disabled={
                    currentPage * ITEMS_PER_PAGE >=
                    details[pinnedCard || hoveredCard].length
                  }
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
