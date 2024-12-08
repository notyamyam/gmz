import React, { useEffect, useState } from "react";
import "../css/style.css";
import Header from "../BG/SalesAdminHeader";
import Sidebar from "../BG/SalesAdminSidebar";
import axios from "axios";
import moment from "moment";
import apiUrl from "../ApiUrl/apiUrl";

import Chart from "react-apexcharts";
import style from "./Dashboard.module.css";

function Dashboard() {
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
      const res = await axios.get(`${apiUrl}/sales_today/`);
      // console.log(res.data.daily_total_sales);
      if (res.status === 200 && res.data.daily_total_sales != null) {
        setSalesToday(res.data.daily_total_sales);
      } else {
        setSalesToday("No sales today.");
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

  useEffect(() => {
    fetchSalesData();
    fetchSalesDashboard();
    fetchSalesToday();
    fetchSalesMonth();
  }, []);

  const handleSeeProducts = async (products) => {
    setModalShowProducts(true);
    setProdArr(products);
  };

  // Function to handle range change
  const handleRangeChange = (event) => {
    setSelectedRange(event.target.value);
  };

  const chartOptions = {
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

  const chartSeries = [
    {
      name: "Total Sales",
      data: salesData,
    },
  ];

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content p-4">
        <div className="d-flex w-100 justify-content-start ">
          <h4>
            <strong style={{ color: "gray" }}>Dashboard</strong>
          </h4>
        </div>

        <div className="d-flex flex-column w-100 gap-2">
          <div className="d-flex w-100 gap-2">
            <div className="d-flex flex-column justify-content-between w-25 gap-2">
              <div
                className={`${style.box} h-100 d-flex w-100 p-2 flex-column justify-content-between`}
              >
                <h5 style={{ color: "gray" }}>Today Sales</h5>
                {salesToday ? (
                  salesToday === "No sales today." ? (
                    <h4
                      className="d-flex w-100 justify-content-end"
                      style={{ color: "gray" }}
                    >
                      <strong>No sales today.</strong>
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
                <Chart
                  options={chartOptions}
                  series={chartSeries}
                  type="bar"
                  height={350}
                  className="d-flex w-100 p-2"
                />
              )}
            </div>
          </div>

          <div className={`${style.chart} d-flex w-100 h-100 p-2`}>
            <table className="table table-bordered">
              <thead className={`${style["t-head"]}`}>
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
                {salesDashboard?.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <strong>NO SALES</strong> TODAY.
                    </td>
                  </tr>
                ) : (
                  salesDashboard?.map((salesDashboard, index) => (
                    <tr key={index} className={`${style["trs"]}`}>
                      <td className="text-start align-middle">
                        {salesDashboard.order_id} -{" "}
                        <strong>{salesDashboard.mop}</strong>
                      </td>
                      <td className="text-start align-middle">
                        {salesDashboard.customer_name}
                      </td>
                      <td className="text-start align-middle">
                        {salesDashboard.customer_loc}
                      </td>

                      <td className="text-start align-middle">
                        {salesDashboard.vehicle_plate}
                      </td>
                      <td className="text-start align-middle">
                        {salesDashboard.time_return}
                      </td>
                      <td className="align-middle">
                        {new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                        }).format(salesDashboard.total_sum_price)}
                      </td>

                      <td className="align-middle">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <button
                            className={` btn btn-primary d-flex align-items-center justify-content-center`}
                            onClick={() => {
                              handleSeeProducts(salesDashboard.products);
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

export default Dashboard;
