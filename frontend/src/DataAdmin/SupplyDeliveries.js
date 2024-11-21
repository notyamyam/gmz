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
  const fetchData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/supDeli`);
      console.log(">>>>", response);
      setSupDeli(response.data);

      const supplierResponse = await axios.get(`${apiUrl}/supplier`);
      setSuppliers(supplierResponse.data);

      const itemResponse = await axios.get(`${apiUrl}/item`);
      setItems(itemResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePlaceOrder = (orderDetails) => {
    // Send the order details to the server to place the order
    axios
      .post(`${apiUrl}/placeOrderDelivery`, orderDetails)
      .then((response) => {
        console.log(response.data.message);
        fetchData();
        setAddModalOpen(false);
      })
      .catch((error) => {
        console.error("Error placing order:", error);
      });
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

  const openUpdateModal = (id) => {
    setSelectedDeliveryId(id);
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
        delivery.matName?.toLowerCase().includes(query.toLowerCase())
    );
  };

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
  }, [searchQuery]);

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="page-title">Supply Deliveries</div>
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="40"
                />
              </div>
            </div>
          </div>
          <div className="t-head">
            <table className="table-head">
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
            </table>
          </div>
          <div className="table-list">
            <table>
              <tbody>
                {supDeli.map((delivery, index) => (
                  <tr key={delivery.supDeliId}>
                    <td>{index + 1}</td>
                    <td>{delivery.supplyName}</td>

                    <td>{delivery.totalQuantity}</td>
                    <td>₱{delivery.totalCost}</td>
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
                      <button
                        className="done-btn"
                        onClick={() => {
                          setOrderedItems(delivery.productDetails);
                          setIsView(true);
                        }}
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button
                        className="btn"
                        onClick={() => confirmDeleteItem(delivery)}
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => openUpdateModal(delivery.supDeliId)}
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        items={items}
        setItems={setItems}
        deliveryId={selectedDeliveryId}
        onUpdate={fetchData}
      />

      {/* Modal Rendering */}
      {isView && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Items Ordered</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Material Name</th>
                  <th>Price</th>
                  <th> Quantity </th>
                  <th> Total Cost </th>
                </tr>
              </thead>
              <tbody>
                {orderedItems.length > 0 ? (
                  orderedItems.map((order, index) => (
                    <tr key={index + 1}>
                      <td>{index + 1}</td>
                      <td>{order.matName}</td>
                      <td>₱ {order.price}</td>
                      <td>{order.quantity}</td>
                      <td>₱ {order.itemTotal}</td>
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
      <ToastContainer />
    </div>
  );
}

export default SupplyDeliveries;
