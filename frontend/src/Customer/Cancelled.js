import React, { useEffect, useState } from "react";
import "../css/style.css";
import Header from "../BG/Customer/CustomerHeader";
import Sidebar from "../BG/Customer/CustomerSidebar";
import style from "./Cancelled.module.css";
import apiUrl from "../ApiUrl/apiUrl";
import axios from "axios";

function History() {
  const userId = localStorage.getItem("id"); // get ID of customer.;

  const [orderProd, setOrderProd] = useState([]); // Fetch orders by
  const [viewOrder, setViewOrder] = useState([]); // Fetch products of order

  const [viewOrderModal, setViewOrderModal] = useState(false);

  const [orderId, setOrderId] = useState("");

  const openViewOrder = (order_id) => {
    setViewOrderModal(true);
    setOrderId(order_id);
    fetchOrderedProducts(order_id);
  };

  const closeViewOrder = () => setViewOrderModal(false);

  const fetchOrderedProducts = async (orderId) => {
    try {
      const res = await axios.post(`${apiUrl}/orders_products/`, {
        userId,
        orderId,
      });

      if (res.data.status === "success") {
        setViewOrder(res.data.res);
        console.log(res.data.res);
      } else {
        throw new Error("No order products found.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchOrdersCancelled = async () => {
    try {
      const res = await axios.get(
        `${apiUrl}/orders_customer_cancelled/${userId}`
      );
      if (res.data.status === "success") {
        setOrderProd(res.data.res);
      } else {
        throw new Error("No orders found.");
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    fetchOrdersCancelled();
    fetchOrderedProducts();
  }, []);

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-between">
          <div className="d-flex w-100 justify-content-start p-2">
            <h5>
              <strong>Cancelled Orders</strong>
            </h5>
          </div>
        </div>

        <div className="table-list">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Total Price</th>
                <th>Date Order</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orderProd.length === 0 ? (
                <tr>
                  <td colSpan="6">NO ORDERS PLACED.</td>
                </tr>
              ) : (
                orderProd.map((product, index) => (
                  <tr key={index}>
                    <td className="w-25 text-start align-middle">
                      {product.order_id}
                    </td>
                    <td className="w-25 text-start align-middle">
                      {new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                      }).format(product.total_sum_price)}
                    </td>
                    <td className="align-middle">{product.date}</td>
                    <td className="align-middle">
                      <span
                        className={`${
                          style[`badge-${product.status.toLowerCase()}`]
                        }`}
                      >
                        <strong>{product.status}</strong>
                      </span>
                    </td>

                    <td className="align-middle">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <button
                          className={`${style.buttonView} btn btn-primary d-flex align-items-center justify-content-center`}
                          onClick={() => {
                            openViewOrder(product.order_id);
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

      {viewOrderModal && (
        <div className="modal-overlay">
          <div className={`modal-content d-flex justify-content-between w-100`}>
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Cancelled Ordered Products</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={closeViewOrder}
              ></button>
            </div>
            <div className="overflow-hidden">
              <div className={`${style.div75} table-list w-100`}>
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
                    {viewOrder?.length === 0 ? (
                      <tr>
                        <td colSpan="6">NO PRODUCTS FOUND.</td>
                      </tr>
                    ) : (
                      viewOrder?.map((item, index) => (
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
