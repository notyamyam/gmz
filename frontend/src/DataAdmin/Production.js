import React, { useEffect, useState } from "react";
import "../css/style.css";
import axios from "axios";
import Header from "../BG/DataAdminHeader";
import Sidebar from "../BG/DataAdminSidebar";
import AddProductionModal from "./AddProductionModal"; // Add production modal
import UpdateProductionModal from "./UpdateProductionModal"; // Update production modal
import ViewMaterialsModal from "./ViewMaterialsModal";
import DeleteModal from "./DeleteModal"; // Import DeleteModal component
import { ToastContainer, toast } from "react-toastify";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "react-toastify/dist/ReactToastify.css"; // Required CSS for toast
import apiUrl from "../ApiUrl/apiUrl";
import DoneModal from "./DoneModal";

function Production() {
  const [productions, setProductions] = useState([]);
  const [items, setItems] = useState([]); // For inventory items
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedProductionId, setSelectedProductionId] = useState(null);
  const [materialUse, setRawMaterialUse] = useState();
  const [isViewMaterialsModalOpen, setIsViewMaterialsModalOpen] =
    useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDoneOpen, setIsDoneOpen] = useState(false);
  const [doneItem, setDoneItem] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null); // Item to delete
  const [searchText, setSearchText] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "", // Default column to sort by
    direction: "asc", // Default sort direction
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Adjust the items per page as needed

  // Fetch production data, inventory items
  const fetchData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/production`);
      setProductions(response.data);
      console.log(response);
      const itemResponse = await axios.get(`${apiUrl}/item`);
      setItems(itemResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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
      await axios
        .delete(`${apiUrl}/production/${id}`)
        .then((res) => {
          fetchData();
          toast.success("Production item deleted successfully!"); // Show success toast
        })
        .catch((err) => {
          toast.error(err.response.data.message);
        });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete production item."); // Show error toast
    }
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete.productionId); // Call deleteItem with the itemId
    }
    setDeleteModalOpen(false); // Close the modal after deletion
    setItemToDelete(null); // Clear the item to delete
  };

  const confirmDeleteItem = (item) => {
    console.log(item);
    setItemToDelete(item); // Set the item to be deleted
    setDeleteModalOpen(true); // Open the delete modal
  };

  const openUpdateModal = (id) => {
    setSelectedProductionId(id);
    setUpdateModalOpen(true);
  };

  const openDoneModal = (item) => {
    setDoneItem(item);
    console.log(item);
    setIsDoneOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setAddModalOpen(true);
  };

  // Helper function to get the item name by itemId
  function getItemName(itemId) {
    const item = items.find((i) => i.itemId === itemId);
    return item ? item.itemName : "Unknown";
  }

  // Sorting function
  const sortedProductions = [...productions].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Filter productions based on search input
  const filteredProductions = sortedProductions.filter((production) => {
    const searchLower = searchText.toLowerCase();
    const itemName = getItemName(production.itemId).toLowerCase();
    const staffName = production.staffName.toLowerCase();

    return itemName.includes(searchLower) || staffName.includes(searchLower);
  });

  // Handle sort column and direction change
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const totalPages = Math.ceil(filteredProductions.length / itemsPerPage);
  const currentData = filteredProductions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDone = async (item, producedQuantity) => {
    console.log(producedQuantity);
    try {
      const response = await axios.put(
        `${apiUrl}/production/complete/${item.productionId}`,
        { producedQuantity }
      );
      fetchData();
      toast.success("Successed");
    } catch (error) {
      console.error("Error completing production:", error);
      toast.error(
        error.response?.data?.message || "Failed to complete production."
      );
    }
  };

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-start ">
          <h4>
            <strong style={{ color: "gray" }}>Production Records</strong>
          </h4>
        </div>
        <div className="info">
          <div className="above-table">
            <div className="above-table-wrapper">
              <button className="btn" onClick={openAddModal}>
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
                  placeholder="Search by Item or Staff"
                  size="40"
                  value={searchText}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSearchText(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="t-head">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th onClick={() => handleSort("productionId")}>#</th>
                  <th onClick={() => handleSort("itemName")}>Item</th>
                  <th>Quantity Produced</th>
                  <th onClick={() => handleSort("productionDate")}>Date</th>
                  <th>Staff</th>
                  <th onClick={() => handleSort("production_status")}>
                    Status
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData?.map((production, index) => (
                  <tr key={index}>
                    <td>{production.productionId}</td>
                    <td>{production.itemName}</td>
                    <td className="text-center">
                      {production.quantityProduced}
                    </td>
                    <td className="w-25 text-center">
                      {formatDate(production.productionDate)}
                    </td>
                    <td>{production.staffName}</td>
                    <td className="text-center align-middle">
                      {" "}
                      <span
                        className={`badge ${
                          production.production_status == 1
                            ? "badge-completed"
                            : "badge-pending"
                        }`}
                      >
                        {production.production_status == 1
                          ? "Completed"
                          : "Proccessing"}
                      </span>
                    </td>
                    <td>
                      <div className="docubutton">
                        <button
                          className="view-btn"
                          onClick={() => {
                            setRawMaterialUse(production.materials);
                            setIsViewMaterialsModalOpen(true);
                          }}
                          style={{ backgroundColor: "red", color: "white" }}
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          className="done-btn"
                          hidden={production.production_status === 1}
                          onClick={() => openDoneModal(production)}
                        >
                          <i className="fa fa-check"></i>
                        </button>
                        <button
                          className="btn"
                          hidden={production.production_status === 1}
                          onClick={() => confirmDeleteItem(production)}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                        <button
                          className="edit-btn"
                          hidden={production.production_status === 1}
                          onClick={() =>
                            openUpdateModal(production.productionId)
                          }
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>{" "}
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

      {/* View Materials Modal */}
      <ViewMaterialsModal
        isOpen={isViewMaterialsModalOpen}
        onClose={() => setIsViewMaterialsModalOpen(false)}
        materials={materialUse}
      />

      <UpdateProductionModal
        isOpen={isUpdateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        items={items}
        productionId={selectedProductionId}
        onUpdate={fetchData} // Refresh data after update
      />

      <DoneModal
        isOpen={isDoneOpen}
        onClose={() => setIsDoneOpen(false)}
        onConfirm={handleDone}
        item={doneItem}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Add Production Modal */}
      <AddProductionModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        items={items}
        onAdd={fetchData} // Refresh data after adding
      />

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Production;
