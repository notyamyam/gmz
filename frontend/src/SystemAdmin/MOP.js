import React, { useEffect, useState } from "react";
import "../css/style.css";
import Header from "../BG/SystemAdminHeader";
import Sidebar from "../BG/SystemAdminSidebar";
import axios from "axios";
import moment from "moment";
import apiUrl from "../ApiUrl/apiUrl";
import style from "./Courier.module.css";

// toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Courier() {
  const [mopArr, setMopArr] = useState([]);
  const [prodArr, setProdArr] = useState([]);

  const [showProd, setShowProd] = useState(false);

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
    : mopArr.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(
    (searchQuery ? filteredOrders.length : mopArr.length) / itemsPerPage
  );

  const [paymentName, setPaymentName] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");

  const [vehicleData, setVehicleData] = useState({
    rider: "",
    vehicle_type: "",
    vehicle_plate: "",
  });

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [hasReference, setHasReference] = useState(false);
  const [originalPayment, setOriginalPayment] = useState("");

  const [selectedMop, setSelectedMop] = useState({
    rider: "",
    attach_file: 0,
  });
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(event.target.value);
    if (query === "") {
      setFilteredOrders([]); // Reset to show all data
    } else {
      const filtered = item.filter((item) => {
        const payment = item.mop ? item.mop.toLowerCase() : "";
        const ref = item.attach_file === 1 ? "yes" : "no"; // Convert 1/0 to "yes"/"no"

        return payment.includes(query) || ref.includes(query);
      });
      setFilteredOrders(filtered);
    }
    setCurrentPage(1);
  };

  const fetchMOP = async () => {
    try {
      const res = await axios.get(`${apiUrl}/get_mop`);
      if (res.data.status === "success") {
        if (Array.isArray(res.data.res)) {
          setMopArr(res.data.res);
          setItem(res.data.res);
        } else {
          setMopArr([]); // If it's not an array, set an empty array
          setItem([]);
        }
      } else {
        console.log("DECLINE ORDERS: ", res.data.res);
      }
    } catch (error) {
      console.error("Error fetching orders:", error.message);
    }
  };

  function resetFields() {
    setPaymentName("");
    setHasReference(false);
    setAddModal(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("payment: ", paymentName, "reference: ", hasReference);
    try {
      const res = await axios.post(
        `${apiUrl}/add-mop`,
        {
          paymentName,
          has_reference: hasReference ? 1 : 0, // Send as 1 (Yes) or 0 (No)
        },
        {
          // Allow 400 response status to be handled as a normal response
          validateStatus: (status) => {
            return status < 500; // allows 400 and 200 statuses
          },
        }
      );

      if (res.status === 400) {
        toast.error(res.data.message);
      } else if (res.status === 200) {
        toast.success(res.data.message);
        resetFields();
      }
    } catch (error) {
      console.error("Error adding mode of payment:", error);
      toast.error("Error adding mode of payment. Please try again.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(
        `${apiUrl}/edit-mop`,
        {
          paymentName: selectedMop.mop, // The new payment name
          originalPaymentName: originalPayment, // The original payment name before edit
          hasReference: selectedMop.attach_file, // Whether it has reference
        },
        {
          // Allow 400 response status to be handled as a normal response
          validateStatus: (status) => {
            return status < 500; // allows 400 and 200 statuses
          },
        }
      );

      if (res.status === 400) {
        toast.error(res.data.message);
      } else if (res.status === 200) {
        toast.success(res.data.message);
        setEditModal(false);
        resetFields(); // Reload the table data
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("Error editing mode of payment:", error);
      toast.error("Error editing mode of payment. Please try again.");
    }
  };

  const handleDelete = async (e) => {
    try {
      const res = await axios.delete(`${apiUrl}/delete-mop`, {
        data: { paymentName: paymentName }, // Send the vehicle_plate in the request body
      });

      if (res.status === 200) {
        toast.success(res.data.message);
        closeDeleteModal(); // Close modal after successful deletion
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting mop. Please try again.");
    }
  };

  const openEditModal = (mopArr) => {
    setEditModal(true); // Show the modal
    setSelectedMop(mopArr); // Set the selected data
    setOriginalPayment(mopArr.mop);
  };

  const openDeleteModal = (payment) => {
    setPaymentName(payment);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    resetFields();
    setDeleteModal(false);
  };

  useEffect(() => {
    if (!searchQuery) {
      fetchMOP();
    }
  }, [mopArr, searchQuery]);

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-start">
          <h4>
            <strong style={{ color: "gray" }}>Mode of payment</strong>
          </h4>
        </div>

        <div className="info">
          <div className="search-container1">
            <div>
              <button
                className="btn btn-primary"
                onClick={() => setAddModal(true)}
              >
                <i className="fa-solid fa-add"></i> Add
              </button>
            </div>
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

          <div className="t-head">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Mode of Payment</th>
                  <th>Has Reference No.</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {mopArr?.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <strong>.....</strong>
                    </td>
                  </tr>
                ) : (
                  currentItems?.map((mopArr, index) => (
                    <tr key={index}>
                      <td className="w-25 text-start align-middle">
                        {mopArr.mop}
                      </td>
                      <td className="text-start align-middle">
                        {mopArr.attach_file === 1 ? "Yes" : "No"}
                      </td>

                      <td className="align-middle">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <button
                            className="edit-btn"
                            onClick={() => openEditModal(mopArr)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            className="done-btn"
                            style={{ backgroundColor: "red" }}
                            onClick={() => {
                              openDeleteModal(mopArr.mop);
                            }}
                          >
                            <i className="fa-solid fa-trash-can"></i>
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
      {addModal && (
        <div className="modal-overlay">
          <div className={`${style["modalConfirm"]} d-flex flex-column w-25`}>
            <div className="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Add Mode of Payment</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={(e) => setAddModal(false)}
              ></button>
            </div>

            <div className="overflow-hidden mt-2 ">
              <form
                className="d-flex flex-column gap-3"
                onSubmit={handleSubmit}
              >
                <div>
                  <span>Payment Name:</span>
                  <input
                    type="text"
                    placeholder="Enter payment name"
                    className="form-control"
                    value={paymentName}
                    onChange={(e) => setPaymentName(e.target.value)}
                    required
                  />
                </div>

                <div className="d-flex align-items-center">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={hasReference}
                    onChange={(e) => setHasReference(e.target.checked)}
                  />
                  <span className="">Has a reference no.</span>
                </div>

                <div className="d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary">
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {editModal && (
        <div className="modal-overlay">
          <div className={`${style["modalConfirm"]} d-flex flex-column w-25`}>
            <div className="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Edit Mode of Payment</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={(e) => setEditModal(false)}
              ></button>
            </div>

            <div className="overflow-hidden mt-2 ">
              <form
                className="d-flex flex-column gap-3"
                onSubmit={handleEditSubmit}
              >
                <div>
                  <span>Payment Name:</span>
                  <input
                    type="text"
                    placeholder="Enter payment name"
                    className="form-control"
                    value={selectedMop.mop}
                    onChange={(e) =>
                      setSelectedMop({ ...selectedMop, mop: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="d-flex align-items-center">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={selectedMop.attach_file === 1}
                    onChange={(e) =>
                      setSelectedMop({
                        ...selectedMop,
                        attach_file: e.target.checked ? 1 : 0,
                      })
                    }
                  />
                  <span className="">Has a reference no.</span>
                </div>

                <div className="d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {deleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              <strong>
                Are you sure you want to delete this mode of payment?
              </strong>
            </h2>
            <p style={{ color: "gray" }}>
              <i>This action cannot be undone</i>
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                onClick={() => {
                  closeDeleteModal();
                }}
                className="btn btn-light"
              >
                Discard
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  handleDelete();
                }}
              >
                Delete it
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />;
    </div>
  );
}

export default Courier;
