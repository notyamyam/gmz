import React, { useEffect, useState } from "react";
import Header from "../BG/SystemAdminHeader";
import Sidebar from "../BG/SystemAdminSidebar";
import AddRawMatsModal from "./AddRawMatsModal";
import EditRawMatsModal from "./EditRawMatsModal";
import RawMatDetailsModal from "./RawMatsDetailsModal"; // Import the new modal
import DeleteModal from "./DeleteModal"; // Import DeleteModal component
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "../css/style.css";
import apiUrl from "../ApiUrl/apiUrl";

function RawMats() {
  const [rawMats, setRawMats] = useState([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [currentMats, setCurrentMats] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Adjust the items per page as needed

  const fetchData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/rawmats`);
      setRawMats(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${apiUrl}/deletemats/${id}`);
      fetchData();
      toast.success("Raw Material deleted successfully!");
    } catch (error) {
      console.error(
        "Error deleting item:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const addRawMat = async (newMat) => {
    try {
      await axios.post(`${apiUrl}/addmats`, newMat);
      fetchData();
      toast.success("Raw Material added successfully!");
    } catch (error) {
      console.error("Error adding raw material:", error);
    }
  };

  const updateRawMat = async (updatedMat) => {
    try {
      await axios.put(`${apiUrl}/updatemats/${updatedMat.matId}`, updatedMat);
      fetchData();
      toast.success("Raw Material updated successfully!");
    } catch (error) {
      console.error("Error updating raw material:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete.matId);
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const confirmDeleteItem = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const openEditModal = (mats) => {
    setCurrentMats(mats);
    setEditModalOpen(true);
  };

  const openDetailsModal = (mats) => {
    setCurrentMats(mats);
    setDetailsModalOpen(true);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredData = rawMats.filter((item) => {
    return (
      item.matName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.total_remaining_quantity
        .toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

  const sortedData = filteredData.sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container1">
      <ToastContainer position="top-right" autoClose={3000} />
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-start ">
          <h4>
            <strong style={{ color: "gray" }}>Raw Materials</strong>
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
                  placeholder="Search by Name or Category..."
                  size="40"
                  value={searchQuery}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSearchQuery(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="t-head">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th onClick={() => handleSort("matName")}>Item Name</th>
                  <th>Quantity</th>
                  <th onClick={() => handleSort("category")}>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentData.map((rawMats, index) => (
                  <tr key={index}>
                    <td>{rawMats.matName}</td>
                    <td>{rawMats.total_remaining_quantity}</td>
                    <td>{rawMats.category}</td>
                    <td>
                      <div className="docubutton">
                        <button
                          className="done-btn"
                          onClick={() => openDetailsModal(rawMats)}
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          className="btn"
                          onClick={() => confirmDeleteItem(rawMats)}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                        <button
                          className="edit-btn"
                          onClick={() => openEditModal(rawMats)}
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

          {/* Pagination */}
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

      {/* Modals */}
      <AddRawMatsModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={addRawMat}
      />
      <EditRawMatsModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        mats={currentMats}
        onUpdate={updateRawMat}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
      <RawMatDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        rawMat={currentMats}
      />
    </div>
  );
}

export default RawMats;
