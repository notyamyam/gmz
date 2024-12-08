import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/style.css";
import Header from "../BG/DataAdminHeader";
import Sidebar from "../BG/DataAdminSidebar";
import AddSupplyDeliveryModal from "./AddSupplyDeliveryModal";
import UpdateSupplyDeliveryModal from "./UpdateSupplyDeliveryModal";
import DeleteModal from "./DeleteModal";

import "@fortawesome/fontawesome-free/css/all.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiUrl from "../ApiUrl/apiUrl";
import ConfirmReceiveModal from "./ConfirmReceiveModal";

function SupplyDeliveries() {
  const [supDeli, setSupDeli] = useState([]); // Track multiple delivery records
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isView, setIsView] = useState(false);
  const [orderedItems, setOrderedItems] = useState([]);
  const [selectedPuchase, setSelectedPurchase] = useState([]);
  const [viewPrice, setViewPrice] = useState(0);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Adjust the items per page as needed
  const fetchData = async () => {
    try {
      await axios
        .get(`${apiUrl}/supplier`)
        .then((res) => {
          setSuppliers(res.data);
        })
        .catch((err) => console.log(err));

      await axios
        .get(`${apiUrl}/supDeli`)
        .then((res) => {
          setSupDeli(res.data);
        })
        .catch((err) => console.log(err));

      await axios
        .get(`${apiUrl}/item`)
        .then((res) => {
          setItems(res.data);
        })
        .catch((err) => console.log(err));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePlaceOrder = async (orderDetails) => {
    // Send the order details to the server to place the order
    await axios
      .post(`${apiUrl}/placeOrderDelivery`, orderDetails)
      .then((response) => {
        toast.success("Order placed.");
        fetchData();
        setAddModalOpen(false);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
        console.error("Error placing order:", error);
      });
  };

  const handleUpdateOrder = async (e, updatedOrder) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${apiUrl}/updateOrderDelivery`,
        updatedOrder
      );
      toast.success("Order updated.");
      fetchData();
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };
  const handleConfirmReceive = async (item, receivedQuantity) => {
    try {
      // Call the merged endpoint to update the item and potentially the order status
      const response = await axios.put(`${apiUrl}/updateItemAndOrderStatus`, {
        orderItemId: item.orderItemId,
        receivedQuantity,
        orderId: item.orderId,
      });

      const { allItemsReceived, message } = response.data;

      // Show a success message
      toast.success(message);

      fetchData();
      setIsConfirmModalOpen(false);
      setIsView(false);
    } catch (error) {
      console.error("Error updating item or order status:", error);
      toast.error("Failed to update item.");
    }
  };

  const getSupply = (id) => {
    const supplier = suppliers.find((supplier) => supplier.supplyId === id);
    return supplier ? supplier.supplyName : "Unknown Supplier";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${apiUrl}/deleteSupDeli/${id}`);
      fetchData();
      toast.success("Supply Delivery deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Error deleting supply delivery.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete.supDeliId);
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const confirmDeleteItem = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const openUpdateModal = (items) => {
    console.log("items>", items);
    setSelectedPurchase(items);
    setSelectedDeliveryId(items.supDeliIds);
    setUpdateModalOpen(true);
  };

  const sortData = (column) => {
    const sortedData = [...supDeli].sort((a, b) => {
      if (sortOrder === "asc") {
        return a[column] > b[column] ? 1 : -1;
      } else {
        return a[column] < b[column] ? 1 : -1;
      }
    });
    setSupDeli(sortedData);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filterData = (query) => {
    return supDeli.filter(
      (delivery) =>
        getSupply(delivery.supplyId)
          ?.toLowerCase()
          .includes(query.toLowerCase()) ||
        delivery.matName?.toLowerCase().includes(query.toLowerCase()) ||
        delivery.totalQuantity
          ?.toString()
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        delivery.totalCost
          ?.toString()
          .toLowerCase()
          .includes(query.toLowerCase())
    );
  };

  const totalPages = Math.ceil(supDeli.length / itemsPerPage);
  const currentData = supDeli.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filteredData = filterData(searchQuery);
      setSupDeli(filteredData);
    } else {
      fetchData();
    }
  }, [supDeli, searchQuery]);

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-start ">
          <h4>
            <strong style={{ color: "gray" }}>Supply Deliveries</strong>
          </h4>
        </div>
        <div className="info">
          <div className="above-table">
            <div className="above-table-wrapper">
              <button className="btn" onClick={() => setAddModalOpen(true)}>
                <i className="fa-solid fa-add"></i> Add
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
                  placeholder="Search by Supplier or Item..."
                  value={searchQuery}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSearchQuery(e.target.value);
                  }}
                  size="40"
                />
              </div>
            </div>
          </div>
          <div className="t-head">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th onClick={() => sortData("supplyId")}>#</th>
                  <th onClick={() => sortData("supplyName")}>Supplier Name</th>

                  <th onClick={() => sortData("totalQuantity")}>Quantity</th>
                  <th onClick={() => sortData("totalCost")}>Cost</th>
                  <th onClick={() => sortData("status")}>Status</th>
                  <th onClick={() => sortData("orderDate")}>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData?.map((delivery, index) => (
                  <tr key={index}>
                    <td>{delivery.orderId}</td>
                    <td>{delivery.supplyName}</td>

                    <td>{delivery.totalQuantity}</td>
                    <td>
                      {new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                      }).format(delivery.totalCost)}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          delivery.status == 1
                            ? "badge-completed"
                            : delivery.status == 2
                            ? "badge-cancelled"
                            : "badge-pending"
                        }`}
                      >
                        {delivery.status == 1
                          ? "Completed"
                          : delivery.status == 2
                          ? "Cancelled"
                          : "Pending"}
                      </span>
                    </td>

                    <td>{formatDate(delivery.orderDate)}</td>
                    <td>
                      <div className="docubutton">
                        <button
                          className="done-btn"
                          style={{ backgroundColor: "red" }}
                          onClick={() => {
                            setOrderedItems(delivery.productDetails);
                            setViewPrice(delivery.totalCost);
                            setIsView(true);
                          }}
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        {/* <button
                          className="btn"
                          onClick={() => confirmDeleteItem(delivery)}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button> */}
                        <button
                          className="edit-btn"
                          hidden={delivery.status == 1}
                          onClick={() => openUpdateModal(delivery)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      <AddSupplyDeliveryModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        suppliers={suppliers}
        items={items}
        onAdd={handlePlaceOrder}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <UpdateSupplyDeliveryModal
        isOpen={isUpdateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        suppliers={suppliers}
        selectedPurchase={selectedPuchase}
        onUpdate={handleUpdateOrder}
      />

      {/* Modal Rendering */}
      {isView && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="isViewModalHeader">
              {" "}
              <h2 style={{ color: "gray" }}>
                {" "}
                <strong>Items Ordered</strong>
              </h2>
              <h2>
                <strong>Total: </strong>

                {new Intl.NumberFormat("en-PH", {
                  style: "currency",
                  currency: "PHP",
                }).format(viewPrice || 0)}
              </h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Material Name</th>
                  <th>Price</th>
                  <th> Ordered (qty) </th>
                  <th> Received (qty) </th>
                  <th> Status </th>
                  <th> Total Cost </th>
                  <th> Action </th>
                </tr>
              </thead>
              <tbody>
                {orderedItems.length > 0 ? (
                  orderedItems.map((order, index) => (
                    <tr key={index + 1}>
                      <td>{index + 1}</td>
                      <td>{order.matName}</td>
                      <td>
                        {new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                        }).format(order.price)}
                      </td>
                      <td>{order.quantity}</td>
                      <td>{order.quantity_received}</td>
                      <td>
                        {" "}
                        <span
                          className={`badge ${
                            order.itemStatus == 1
                              ? "badge-completed"
                              : order.itemStatus == 2
                              ? "badge-cancelled"
                              : "badge-pending"
                          }`}
                        >
                          {order.itemStatus == 1
                            ? "Completed"
                            : order.itemStatus == 2
                            ? "Cancelled"
                            : "Pending"}
                        </span>
                      </td>
                      <td>
                        {new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                        }).format(order.itemTotal)}
                      </td>
                      <td>
                        {" "}
                        <div className="docubutton">
                          <button
                            className="edit-btn"
                            hidden={order.itemStatus == 1}
                            onClick={() => {
                              setSelectedItem(order);
                              setIsConfirmModalOpen(true);
                            }}
                          >
                            <i className="fa-solid fa-arrow-right"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
            <button type="button" onClick={() => setIsView(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <ConfirmReceiveModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmReceive}
        item={selectedItem}
      />

      <ToastContainer />
    </div>
  );
}

export default SupplyDeliveries;
