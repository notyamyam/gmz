import React, { useEffect, useState } from "react";
import "../css/style.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Header from "../BG/SystemAdminHeader";
import Sidebar from "../BG/SystemAdminSidebar";
import AddItemModal from "./AddItemModal";
import EditItemModal from "./EditItemModal";
import DetailsModal from "./ItemDetailsModal";
import DeleteModal from "./DeleteModal";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiUrl from "../ApiUrl/apiUrl";

function Inventory() {
  const [item, setItem] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [inventoryDetails, setInventoryDetails] = useState([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "itemName",
    direction: "asc",
  });

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // You can adjust this number as needed

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await fetch(`${apiUrl}/item`);
      const data = await response.json();
      setItem(data);
      setFilteredItems(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchInventoryDetails = async (itemId) => {
    try {
      const response = await axios.get(`${apiUrl}/inventory-data/${itemId}`);
      setInventoryDetails(response.data);
    } catch (error) {
      console.error("Error fetching inventory details:", error);
    }
  };

  const addItem = async (newItem) => {
    try {
      const response = await axios.post(`${apiUrl}/additem`, newItem);
      fetchData();
      toast.success("Item added successfully!");
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item.");
    }
  };

  const updateItem = async (updatedItem) => {
    try {
      const response = await axios.put(
        `${apiUrl}/updateitem/${updatedItem.itemId}`,
        updatedItem
      );
      fetchData();
      toast.success("Item updated successfully!");
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item.");
    }
  };

  const deleteItem = async (id) => {
    try {
      const response = await axios
        .delete(`${apiUrl}/deleteitem/${id}`)
        .then((res) => {
          fetchData();
          toast.success("Item deleted successfully!");
        })
        .catch((err) => toast.error(err.response.data));
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete.itemId);
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const confirmDeleteItem = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditModal = (item) => {
    setCurrentItem(item);
    setEditModalOpen(true);
  };

  const openDetailsModal = (item) => {
    setCurrentItem(item);
    fetchInventoryDetails(item.itemId);
    setDetailsModalOpen(true);
  };

  const handleSearch = (event) => {
    setCurrentPage(1);
    setSearchQuery(event.target.value);
    const query = event.target.value.toLowerCase();
    const filtered = item.filter(
      (item) =>
        item.itemName.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.price.toString().toLowerCase().includes(query) || // Include price field
        item.totalQuantity.toString().toLowerCase().includes(query) // Include totalQuantity field
    );
    setFilteredItems(filtered);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    const sortedItems = [...filteredItems].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredItems(sortedItems);
    setSortConfig({ key, direction });
  };

  // Paginate the items based on currentPage
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="container1">
      <ToastContainer position="top-right" autoClose={3000} />
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-start ">
          <h4>
            <strong style={{ color: "gray" }}>Inventory</strong>
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
                  placeholder="Search"
                  size="40"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>
          <div className="t-head">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th onClick={() => handleSort("itemName")}>Product Name</th>
                  <th onClick={() => handleSort("price")}>Price</th>
                  <th onClick={() => handleSort("category")}>Category</th>
                  <th onClick={() => handleSort("totalQuantity")}>Quantity</th>
                  <th onClick={() => handleSort("description")}>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.itemName}</td>
                    <td>
                      {new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                      }).format(item.price)}
                    </td>
                    <td>{item.category}</td>
                    <td className="text-center">{item.totalQuantity}</td>
                    <td>{item.description}</td>
                    <td>
                      <div className="docubutton">
                        <button
                          className="done-btn"
                          onClick={() => openDetailsModal(item)}
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          className="edit-btn"
                          onClick={() => openEditModal(item)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          className="btn"
                          onClick={() => confirmDeleteItem(item)}
                        >
                          <i className="fa-solid fa-trash-can"></i>
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
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={addItem}
      />
      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        item={currentItem}
        onUpdate={updateItem}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
      <DetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        item={currentItem}
        inventoryDetails={inventoryDetails}
      />
    </div>
  );
}

export default Inventory;
