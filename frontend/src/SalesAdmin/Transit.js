import React, { useEffect, useState } from "react";
import "../css/style.css";
import Header from "../BG/SalesAdminHeader";
import Sidebar from "../BG/SalesAdminSidebar";
import axios from "axios";
import apiUrl from "../ApiUrl/apiUrl";

import style from "./Transit.module.css";
//toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Transit() {
  const [userId, setUserId] = useState("");

  const [orderId, setOrderId] = useState("");
  const [cusOrders, setCusOrders] = useState([]);

  const [refNo, setRefNo] = useState("");
  const [totalPrice, setTotalPrice] = useState("");

  const [transit, setTransit] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [modalShowOrder, setModalShowOrder] = useState(false);
  const [modalShowProducts, setModalShowProducts] = useState(false);

  const [modalCourierDone, setModalCourierDone] = useState(false);

  // MODAL FOR DELIVERY DONE PER COURIER
  const [modalDoneDelivery, setModalDoneDelivery] = useState(false);
  const [courierDoneArray, setCourierDoneArray] = useState([]);

  //MODAL FOR DONE DELIVERY ORDERS
  const [modalDoneOrders, setModalDoneOrders] = useState(false);
  const [ordersDoneArray, setOrdersDoneArray] = useState([]);

  //MODAL FOR PRODUCTS OF ORDERS
  const [modalDoneProducts, setModalDoneProducts] = useState(false);
  const [productsDoneArray, setProductsDoneArray] = useState([]);

  const [plate, setPlate] = useState("");

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
    : transit.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(
    (searchQuery ? filteredOrders.length : transit.length) / itemsPerPage
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

  const fetchTransit = async () => {
    try {
      const res = await axios.get(`${apiUrl}/transit`);
      console.log(res.data.res);
      if (Array.isArray(res.data.res)) {
        setTransit(res.data.res);
        setItem(res.data.res);
      } else {
        setTransit([]);
        setItem([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchCourierDone = async () => {
    try {
      const res = await axios.get(`${apiUrl}/fetchDoneCourier`);
      console.log("Courier Done: ", res.data.res);
      if (Array.isArray(res.data.res)) {
        setCourierDoneArray(res.data.res);
      } else {
        setCourierDoneArray([]); // If it's not an array, set an empty array
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (!searchQuery) {
      fetchTransit();
    }
  }, [ searchQuery]);

  const openModalShowOrder = (data) => {
    console.log("==>", data);
    setOrders(data);
    // setUserId(item.userId);
    // setOrderId(data.orde);
    // setRefNo(item.refNo);
    // setTotalPrice(item.totalPrice);
    setModalShowOrder(true);
  };

  const openModalShowProduct = (data) => {
    setProducts(data);
    console.log("order id: ", data[0].order_id);
    setOrderId(data[0].order_id);
    setModalShowProducts(true);
  };

  const openConfirm = async (plate) => {
    setPlate(plate);
    setModalCourierDone(true);
  };

  const handleInsertSales = async (plate) => {
    try {
      const res = await axios.post(`${apiUrl}/insertSales`, { plate });
      
      const notif_done = await axios.post(
        `${apiUrl}/insert_notif_done/`,
        cusOrders
      );

      if ( 
        notif_done.data.status === "success"
      ) {
        toast.success(res.data.message);
        setCusOrders([]);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  // Modal for opening done delivery
  const handleOpenCourierDone = async () => {
    fetchCourierDone();
    // setCourierDoneArray(data);
    setModalDoneDelivery(true);
  };

  const handleOpenDoneOrders = (orders) => {
    setOrdersDoneArray(orders);
    setModalDoneOrders(true);
  };

  const handleOpenDoneProducts = (products) => {
    console.log(products);
    setProductsDoneArray(products);
    setModalDoneProducts(true);
  };

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-start">
          <h4>
            <strong style={{ color: "gray" }}>Transit</strong>
          </h4>
        </div>
        <div className="info">
          <div className="above-table">
            <div className="above-table-wrapper">
              <button
                type="button"
                className="btn btn-danger btn-sm "
                onClick={() => {
                  
                  handleOpenCourierDone();
                }}
              >
                <i
                  className="fa fa-check me-1"
                  style={{ fontSize: "12px" }}
                ></i>
                <span style={{ fontSize: "12px" }}>Courier done delivery</span>
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
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>

          <div className="table-list">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Plate</th>
                  <th>Courier Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transit?.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <strong>NO ONGOING</strong> DELIVERY.
                    </td>
                  </tr>
                ) : (
                  currentItems?.map((transit, index) => (
                    <tr key={index}>
                      <td className="text-start align-middle ">
                        <span className="me-2">
                          {" "}
                          {transit.vehicle_plate}{" "}
                          <strong>
                            {" "}
                            <i>({transit.vehicle_type})</i>
                          </strong>
                        </span>
                      </td>
                      <td className="text-start align-middle">
                        {transit.rider}{" "}
                      </td>

                      <td className="w-25 align-middle">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <button
                            className={`btn btn-primary d-flex align-items-center justify-content-center`}
                            style={{ backgroundColor: "blue" }}
                            onClick={() => {
                              console.log("plate: ", transit.vehicle_plate);
                              console.log(transit.orders);

                              transit.orders.map((order) => {
                                cusOrders.push({
                                  customer_id: order.customer_id,
                                  order_id: order.order_id,
                                });
                              });
                              openConfirm(transit.vehicle_plate);
                            }}
                          >
                            <i
                              className="fa fa-check"
                              style={{ fontSize: "15px" }}
                            ></i>
                          </button>

                          <button
                            className={` btn btn-primary d-flex align-items-center justify-content-center`}
                            onClick={() => {
                              openModalShowOrder(transit.orders);
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
      {modalShowOrder && (
        <div className="modal-overlay">
          <div className={`${style["modalContent"]} d-flex flex-column w-100`}>
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Carried Orders</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={(e) => setModalShowOrder(false)}
              ></button>
            </div>

            <div className="overflow-hidden">
              <div className={`table-list w-100`}>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Order Id</th>
                      <th>Deliver to</th>
                      <th>Deliver Out</th>
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
                            <strong>
                              {" "}
                              <i>({order.mop})</i>
                            </strong>
                          </td>
                          <td className="w-25 text-start align-middle">
                            {order.customer_loc}
                            <strong>
                              {" "}
                              <i>({order.customer_name})</i>
                            </strong>
                          </td>
                          <td className="w-25 text-start align-middle">
                            {order.time_out}
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
                                openModalShowProduct(order.products);
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
              </div>
            </div>
          </div>
        </div>
      )}
      {modalShowProducts && (
        <div className="modal-overlay">
          <div className={`${style["modalContent"]} d-flex flex-column w-100`}>
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Product Orders</strong> | {orderId}
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
                    {products?.length === 0 ? (
                      <tr>
                        <td colSpan="6">NO PRODUCTS FOUND.</td>
                      </tr>
                    ) : (
                      products?.map((products, index) => (
                        <tr key={index}>
                          <td className="w-25 text-start align-middle">
                            {products.item_name}
                          </td>
                          <td className="w-25 text-start align-middle">
                            {products.description}
                          </td>
                          <td className="align-middle">
                            {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(products.price)}
                          </td>
                          <td className="w-25 text-start align-middle">
                            {products.quantity}
                          </td>
                          <td className="align-middle">
                            {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(products.total_price)}
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
      {modalCourierDone && (
        <div className="modal-overlay">
          <div
            className={`${style["modalConfirm"]} w-25 d-flex flex-column gap-3`}
          >
            <div className="d-flex w-100 justify-content-between">
              <span>
                <strong>Order Delivered</strong>
              </span>

              <button
                type="button"
                className="btn-close bg-light"
                onClick={(e) => setModalCourierDone(false)}
              ></button>
            </div>

            <div>Has the delivery for the orders been completed?</div>
            <div className="d-flex w-100 justify-content-end gap-2 ">
              <button
                className="btn btn-light"
                onClick={(e) => setModalCourierDone(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={(e) => {
                  setModalCourierDone(false);
                  handleInsertSales(plate);
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL FOR DONE DELIVERY PER COURIER */}
      {modalDoneDelivery && (
        <div className="modal-overlay">
          <div className={`${style["modalContent"]} d-flex flex-column w-100`}>
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>List of Done Delivery</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={(e) => setModalDoneDelivery(false)}
              ></button>
            </div>

            <div className="overflow-hidden">
              <div className={`table-list w-100`}>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Plate</th>
                      <th>Courier Name</th>
                      <th>Date & Time Return</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courierDoneArray?.length === 0 ? (
                      <tr>
                        <td colSpan="6">NO PRODUCTS FOUND.</td>
                      </tr>
                    ) : (
                      courierDoneArray?.map((courierDoneArray, index) => (
                        <tr key={index}>
                          <td className="w-25 text-start align-middle">
                            {courierDoneArray.vehicle_plate}
                          </td>
                          <td className="w-25 text-start align-middle">
                            {courierDoneArray.rider}
                          </td>

                          <td className="w-25 text-start align-middle">
                            {courierDoneArray.time_return}
                          </td>

                          <td className="w-25 text-start align-middle">
                            <button
                              className={` btn btn-primary d-flex align-items-center justify-content-center`}
                              onClick={() => {
                                // openModalShowOrder(transit.orders);
                                handleOpenDoneOrders(courierDoneArray.orders);
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
              </div>
            </div>
          </div>
        </div>
      )}
      {modalDoneOrders && (
        <div className="modal-overlay">
          <div className={`${style["modalContent"]} d-flex flex-column w-100`}>
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Orders</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={(e) => setModalDoneOrders(false)}
              ></button>
            </div>

            <div className="overflow-hidden">
              <div className={`table-list w-100`}>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Deliver Location</th>
                      <th>Customer Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersDoneArray?.length === 0 ? (
                      <tr>
                        <td colSpan="6">NO PRODUCTS FOUND.</td>
                      </tr>
                    ) : (
                      ordersDoneArray?.map((ordersDoneArray, index) => (
                        <tr key={index}>
                          <td className="w-25 text-start align-middle">
                            {ordersDoneArray.order_id} -{" "}
                            <strong>{ordersDoneArray.mop}</strong>
                          </td>
                          <td className="w-25 text-start align-middle">
                            {ordersDoneArray.customer_loc}
                          </td>
                          <td className="w-25 text-start align-middle">
                            {ordersDoneArray.customer_name}
                          </td>
                          <td className="w-25 text-start align-middle">
                            <button
                              className={` btn btn-primary d-flex align-items-center justify-content-center`}
                              onClick={() => {
                                handleOpenDoneProducts(
                                  ordersDoneArray.products
                                );
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
              </div>
            </div>
          </div>
        </div>
      )}
      {modalDoneProducts && (
        <div className="modal-overlay">
          <div className={`${style["modalContent"]} d-flex flex-column w-100`}>
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Orders</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={(e) => setModalDoneProducts(false)}
              ></button>
            </div>

            <div className="overflow-hidden">
              <div className={`table-list w-100`}>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Description</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsDoneArray?.length === 0 ? (
                      <tr>
                        <td colSpan="6">NO PRODUCTS FOUND.</td>
                      </tr>
                    ) : (
                      productsDoneArray?.map((productsDoneArray, index) => (
                        <tr key={index}>
                          <td className="w-25 text-start align-middle">
                            {productsDoneArray.item_name}
                          </td>
                          <td className="w-25 text-start align-middle">
                            {productsDoneArray.description}
                          </td>
                          <td className="w-25 text-start align-middle">
                            {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(productsDoneArray.price)}
                          </td>
                          <td className="text-start align-middle">
                            {productsDoneArray.quantity}
                          </td>
                          <td className="w-25 text-start align-middle">
                            {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(productsDoneArray.total_price)}
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

export default Transit;
