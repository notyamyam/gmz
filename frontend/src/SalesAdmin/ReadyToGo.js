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

function ReadyToGo() {
  //modal viewing of productss per order
  const [viewOrderModel, setViewOrderModel] = useState(false);
  const [viewProductModel, setViewProductModel] = useState(false);

  //modal for choosing vehicle

  const [userId, setUserId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [refNo, setRefNo] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [plate, setPlate] = useState("");

  const [couriers, setCouriers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productss, setProductss] = useState([]);

  const fetchCourierReady = async () => {
    try {
      const res = await axios.get(`${apiUrl}/courier_ready`); // Adjust the URL if necessary
      console.log("res", res.data.res);
      setCouriers(res.data.res);
      // setOrders(res.data.res.ordersWithProducts);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchCourierReady();
  }, []);

  const openOrderModal = (data) => {
    console.log("ORDERS: ", data);
    setOrders(data);
    setViewOrderModel(true);
    setRefNo(data.refNo);
    setTotalPrice(data.totalPrice);
  };

  const openProductModal = (data) => {
    console.log("PRODUCTS NG ORDER: ", data);
    setProductss(data);
    setViewProductModel(true);
  };

  const handleStatusTransit = async () => {
    try {
      const res = await axios.post(`${apiUrl}/status_transit/`, {
        plate,
      });
      if (res.data.status === "success") {
        toast.success("Its on the way! See on TRANSIT");
        setViewOrderModel(false);
      } else {
        throw new Error("...");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-start">
          <h4>
            <strong>READY TO GO COURIER</strong>
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
                  <th>Driver Name</th>
                  <th>Vehicle</th>
                  <th>Vehicle Plate</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {couriers?.length === 0 ? (
                  <tr>
                    <td colSpan="6">NO COURIERS ARE AVAILABLE TO PROCEED.</td>
                  </tr>
                ) : (
                  couriers?.map((couriers, index) => (
                    <tr key={index}>
                      <td className="text-start align-middle ">
                        <span className="me-2">{couriers.rider}</span>
                      </td>
                      <td className="text-start align-middle">
                        {couriers.vehicle_type}
                      </td>
                      <td className="text-start align-middle">
                        {couriers.vehicle_plate}
                      </td>

                      <td className="w-25 align-middle">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <button
                            className={` btn btn-primary d-flex align-items-center justify-content-center`}
                            onClick={() => {
                              console.log(couriers.vehicle_plate);
                              openOrderModal(couriers.orders);
                              setUserId(couriers.userId);
                              setOrderId(couriers.order_id);
                              setRefNo(couriers.ref_no);
                              setTotalPrice(couriers.total_price);
                              setPlate(couriers.vehicle_plate);
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
      {/* VIEW ORDERS OF RIDERS */}
      {viewOrderModel && (
        <div className="modal-overlay">
          <div className={`modal-content d-flex justify-content-between w-100`}>
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Carried Orders</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={(e) => setViewOrderModel(false)}
              ></button>
            </div>

            <div className="overflow-hidden">
              <div className={`table-list w-100`}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order Id</th>
                      <th>Deliver to</th>
                      <th>Total Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders?.length === 0 ? (
                      <tr>
                        <td colSpan="6">NO ORDERS FOUND.</td>
                      </tr>
                    ) : (
                      orders?.map((order, index) => (
                        <tr key={index}>
                          <td className="w-25 text-start align-middle">
                            {order.order_id}
                          </td>
                          <td className="w-25 text-start align-middle">
                            {order.customer_loc}
                          </td>
                          <td className="align-middle">
                            {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(order.total_sum_price)}
                          </td>
                          <td className="align-middle">
                            <button
                              className={` btn btn-danger d-flex align-items-center justify-content-center`}
                              onClick={() => {
                                openProductModal(order.products);
                              }}
                            >
                              <i
                                className="fa fa-eye"
                                style={{ fontSize: "15px" }}
                              ></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className="d-flex w-100 justify-content-end gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      // setChooseVehicle(true);
                      handleStatusTransit();
                    }}
                  >
                    <span>Confirm</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {viewProductModel && (
        <div className="modal-overlay">
          <div className={`modal-content d-flex justify-content-between w-100`}>
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Product Orders</strong> | {orderId}
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={(e) => setViewProductModel(false)}
              ></button>
            </div>

            <div className="overflow-hidden">
              <div className={`table-list w-100`}>
                <table className="table">
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
                    {productss?.length === 0 ? (
                      <tr>
                        <td colSpan="6">NO PRODUCTS FOUND.</td>
                      </tr>
                    ) : (
                      productss?.map((productss, index) => (
                        <tr key={index}>
                          <td className="w-25 text-start align-middle">
                            {productss.item_name}
                          </td>
                          <td className="w-25 text-start align-middle">
                            {productss.description}
                          </td>
                          <td className="align-middle">
                            {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(productss.price)}
                          </td>
                          <td className="w-25 text-start align-middle">
                            {productss.quantity}
                          </td>
                          <td className="align-middle">
                            {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(productss.total_price)}
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
      <ToastContainer />;
    </div>
  );
}

export default ReadyToGo;
