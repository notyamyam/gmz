import React, { useEffect, useState } from "react";
import "../css/style.css";
import Header from "../BG/SalesAdminHeader";
import Sidebar from "../BG/SalesAdminSidebar";
import axios from "axios";
import moment from "moment";
import EditOrderModal from "./EditOrderModal";
import apiUrl from "../ApiUrl/apiUrl";

import style from "./ReadyToGo.module.css";

//toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ReadyToGo() {
  const [cusOrders, setCusOrders] = useState([]);

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

  // Paginate the items based on currentPage
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [item, setItem] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = searchQuery
    ? filteredOrders.slice(indexOfFirstItem, indexOfLastItem)
    : couriers.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(
    (searchQuery ? filteredOrders.length : couriers.length) / itemsPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(event.target.value);
    if (query === "") {
      setFilteredOrders([]); // Reset to show all data
    } else {
      const filtered = item.filter((item) => {
        const courierName = item.rider ? item.rider.toLowerCase() : "";
        const vehiclePlate = item.vehicle_plate
          ? item.vehicle_plate.toLowerCase()
          : "";
        const vehicleType = item.vehicle_type
          ? item.vehicle_type.toLowerCase()
          : "";

        return (
          courierName.includes(query) ||
          vehiclePlate.includes(query) ||
          vehicleType.includes(query)
        );
      });
      setFilteredOrders(filtered);
    }
    setCurrentPage(1);
  };

  const fetchCourierReady = async () => {
    try {
      const res = await axios.get(`${apiUrl}/courier_ready`); // Adjust the URL if necessary
      // console.log(res);
      if (Array.isArray(res.data.res)) {
        setCouriers(res.data.res);
        setItem(res.data.res);
      } else {
        console.log("Expected an array but got:", res.data.res);
        setCouriers([]);
        setItem([]);
      }
      // setOrders(res.data.res.ordersWithProducts);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    if (!searchQuery) {
      fetchCourierReady();
    }
  }, [couriers, searchQuery]);

  const openOrderModal = (data) => {
    setOrders(data);
    setViewOrderModel(true);
    setRefNo(data.refNo);
    setTotalPrice(data.totalPrice);
  };

  const openProductModal = (data) => {
    setProductss(data);
    setOrderId(data[0].order_id);
    setViewProductModel(true);
  };

  const handleStatusTransit = async () => {
    try {
      const res = await axios.post(`${apiUrl}/status_transit/`, {
        plate,
      });

      const notif_transit = await axios.post(
        `${apiUrl}/insert_notif_transit/`,
        cusOrders
      );

      if (
        res.data.status === "success" &&
        notif_transit.data.status === "success"
      ) {
        toast.success("Its on the way! See on TRANSIT");
        setViewOrderModel(false);
        setCusOrders([]);
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
            <strong style={{ color: "gray" }}>READY TO PICKUP</strong>
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
                  placeholder="Search..."
                  size="40"
                  value={searchQuery}
                  onChange={handleSearch}
                />
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
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Courier Name</th>
                  <th>Vehicle</th>
                  <th>Vehicle Plate</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {couriers?.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <strong>NO COURIERS</strong> TO PROCEED.
                    </td>
                  </tr>
                ) : (
                  currentItems?.map((couriers, index) => (
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
                              couriers.orders.map((order) => {
                                cusOrders.push({
                                  customer_id: order.customer_id,
                                  order_id: order.order_id,
                                });
                              });
                              openOrderModal(couriers.orders);
                              setUserId(couriers.orders[0].customer_id);
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
      {/* VIEW ORDERS OF RIDERS */}
      {viewOrderModel && (
        <div className="modal-overlay">
          <div className={`${style["modalContent"]} d-flex flex-column w-100 `}>
            <div class="d-flex w-100 justify-content-between">
              <h5>
                <strong>Carried Orders</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={(e) => {
                  setViewOrderModel(false);
                  setCusOrders([]);
                }}
              ></button>
            </div>

            <div className="table-list">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Order Id</th>
                    <th>Customer Name</th>
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
                          {order.customer_name}
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
      )}
      {viewProductModel && (
        <div className="modal-overlay">
          <div className={`${style["modalContent"]} d-flex flex-column w-100`}>
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
      )}
      <ToastContainer />;
    </div>
  );
}

export default ReadyToGo;
