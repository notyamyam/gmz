import React, { useEffect, useState } from "react";
import "../css/style.css";
import Header from "../BG/SalesAdminHeader";
import Sidebar from "../BG/SalesAdminSidebar";
import axios from "axios";
import moment from "moment";
import EditOrderModal from "./EditOrderModal";
import apiUrl from "../ApiUrl/apiUrl";

//toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PreparedOrders() {
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]); // New state to hold items
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  //modal viewing of products per order
  const [viewPreparingModal, setViewPreparedModal] = useState(false);

  //modal for choosing vehicle
  const [chooseVehicle, setChooseVehicle] = useState(false);
  const [vehicle, setVehicle] = useState([]); //array for tblvehicle
  const [selectedType, setSelectedType] = useState(""); // Selected vehicle type
  const [availableVehicles, setAvailableVehicles] = useState([]); // Array for filtered vehicles that is available.

  const [preparedOrders, setPreparedOrders] = useState([]);
  const [viewPreparedOrders, setViewPreparedOrders] = useState([]);

  const [userId, setUserId] = useState("");
  const [orderId, setOrderId] = useState("");

  const [refNo, setRefNo] = useState("");
  const [totalPrice, setTotalPrice] = useState("");

  const openViewPreparedOrders = (data) => {
    setViewPreparedModal(true);
    setViewPreparedOrders(data);
  };

  const closeViewPreparedOrders = () => {
    setViewPreparedModal(false);
  };

  // Fetch orders preparing from the backend
  const fetchPrepared = async () => {
    try {
      const res = await axios.get(`${apiUrl}/prepared_Orders`);
      console.log(res);

      if (res.data.status === "success") {
        console.log("PREPARING ORDERS: ", res.data.res);
        setPreparedOrders(res.data.res);
      } else {
        throw new Error("No orders found.");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchVehicle = async () => {
    try {
      const res = await axios.get(`${apiUrl}/vehicle`);
      console.log("fetched vehicle: ", res.data.res);
      setVehicle(res.data.res);
    } catch (error) {
      console.log("ERROR: ", error);
    }
  };

  useEffect(() => {
    fetchPrepared();
    fetchVehicle();
  }, []);

  const handleUpdateOrder = async (updatedOrder) => {
    try {
      await axios.put(`${apiUrl}/orders/${updatedOrder.orderId}`, updatedOrder);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === updatedOrder.orderId ? updatedOrder : order
        )
      );
      setEditModalOpen(false);
      fetchPrepared();
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  // Function to get item name by itemI

  const handleVehicleTypeChange = async (e) => {
    const type = e.target.value;
    setSelectedType(type);

    if (type) {
      try {
        const res = await axios.post(`${apiUrl}/avail_vehicles`, {
          type: type,
        });
        console.log("===>", res);
        setAvailableVehicles(res.data.res);
      } catch (error) {
        console.error("Error fetching available vehicles: ", error);
      }
    }
  };

  const handleStatusReady = async (orderId) => {
    try {
      const res = await axios.post(`${apiUrl}/status_ready/`, {
        orderId,
        selectedVehicle,
      });

      if (res.data.status === "success") {
        toast.success("Deliver it on Ready to go!");

        setChooseVehicle(false);
        closeViewPreparedOrders();
      } else {
        throw new Error("No order products found.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Handle change event when a user selects a vehicle
  const handleGetSelectedPlate = (event) => {
    const selectedPlate = event.target.value; // This is the selected vehicle's vehicle_plate
    setSelectedVehicleId(selectedPlate); // Update the selected vehicle plate

    // Find the vehicle object that matches the selected vehicle_plate
    const vehicle = availableVehicles.find(
      (v) => v.vehicle_plate === selectedPlate
    ); // Compare with v.vehicle_plate

    if (vehicle) {
      console.log("ORDER ID:", orderId);
      console.log("Selected Vehicle Plate:", vehicle.vehicle_plate); // Log the vehicle plate
      setSelectedVehicle(vehicle.vehicle_plate); // Store the selected vehicle details
    }
  };

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-start">
          <h4>
            <strong>Prepared Orders and Assigning Riders</strong>
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
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Location</th>
                  <th>Date Order (MM-DD-YYYY)</th>
                  <th>Total Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {preparedOrders?.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      NO <strong>PREPARED</strong> ORDERS PLACED.
                    </td>
                  </tr>
                ) : (
                  preparedOrders?.map((preparedOrders, index) => (
                    <tr key={index}>
                      <td className="text-start align-middle ">
                        <span className="me-2">{preparedOrders.order_id}</span>
                        <strong className="me-2">
                          <i>{preparedOrders.mop}</i>
                        </strong>
                        <strong className="me-2">
                          <i>{preparedOrders.status}</i>
                        </strong>
                        <strong>
                          <i>{preparedOrders.ref_no}</i>
                        </strong>
                      </td>
                      <td className="text-start align-middle ">
                        <span className="me-2">
                          {preparedOrders.customer_name}
                        </span>
                      </td>
                      <td className="text-start align-middle">
                        {preparedOrders.customer_loc}
                      </td>
                      <td className="text-start align-middle">
                        {preparedOrders.date}
                      </td>

                      <td className="text-start align-middle">
                        {new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                        }).format(preparedOrders.total_sum_price)}
                      </td>

                      <td className="align-middle">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <button
                            className={` btn btn-primary d-flex align-items-center justify-content-center`}
                            onClick={() => {
                              openViewPreparedOrders(preparedOrders.products);
                              setUserId(preparedOrders.userId);
                              setOrderId(preparedOrders.order_id);
                              setRefNo(preparedOrders.ref_no);
                              setTotalPrice(preparedOrders.total_price);
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
      {isEditModalOpen && (
        <EditOrderModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          onUpdate={handleUpdateOrder}
          order={selectedOrder}
        />
      )}
      {/* VIEW PRODUCTS OF ORDERS */}
      {viewPreparingModal && (
        <div className="modal-overlay">
          <div className={`modal-content d-flex justify-content-between w-100`}>
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Ordered Products</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={closeViewPreparedOrders}
              ></button>
            </div>
            <div className="d-flex w-100 justify-content-between mt-2">
              <h6>{refNo ? `Reference No: ${refNo}` : "COD"}</h6>
              <h6>
                Total Price:{" "}
                <strong>
                  {" "}
                  {new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                  }).format(totalPrice)}
                </strong>
              </h6>
            </div>
            <div className="overflow-hidden">
              <div className={`table-list w-100`}>
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
                    {viewPreparedOrders?.length === 0 ? (
                      <tr>
                        <td colSpan="6">NO PRODUCTS FOUND.</td>
                      </tr>
                    ) : (
                      viewPreparedOrders?.map((item, index) => (
                        <tr key={index}>
                          <td className="w-25 text-start align-middle">
                            {item.item_name}
                          </td>
                          <td className="w-25 text-start align-middle">
                            {item.description}
                          </td>
                          <td className="align-middle">
                            {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(item.price)}
                          </td>
                          <td className="align-middle">{item.quantity}</td>
                          <td className="align-middle">
                            {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(item.total_price)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className="d-flex w-100 justify-content-end gap-2">
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      setChooseVehicle(true);
                    }}
                  >
                    <i className="fa fa-truck "></i>
                    <span className="ms-1">Assign a Courier</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal for choosing vehicle */}
      {chooseVehicle && (
        <div className="modal-overlay">
          <div className={`modal-content d-flex justify-content-between w-50`}>
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Available Vehicle</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={() => {
                  setChooseVehicle(false);
                  setAvailableVehicles([]);
                }}
              ></button>
            </div>

            <div className="d-flex w-100 flex-column gap-1">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleStatusReady(orderId);
                }}
              >
                <div>
                  <span>Vehicle Type:</span>
                  <select required onChange={handleVehicleTypeChange}>
                    <option value="">-- Select a Vehicle --</option>
                    {vehicle.map((v) => (
                      <option key={v.plate} value={v.vehicle_type}>
                        {v.vehicle_type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span>Choose vehicle:</span>
                  <select
                    required
                    disabled={!selectedType}
                    onChange={handleGetSelectedPlate}
                    value={selectedVehicleId}
                  >
                    <option value="">-- Select a Vehicle --</option>
                    {availableVehicles?.map((v) => (
                      <option key={v.vehicle_plate} value={v.vehicle_plate}>
                        {v.vehicle_plate} - ({v.rider})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="d-flex w-100 justify-content-end">
                  <button className="btn btn-primary">Confirm</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />;
    </div>
  );
}

export default PreparedOrders;
