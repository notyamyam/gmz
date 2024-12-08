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
  const [couriersArr, setCouriersArr] = useState([]);
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
    : couriersArr.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(
    (searchQuery ? filteredOrders.length : couriersArr.length) / itemsPerPage
  );

  const [rider, setRider] = useState("");
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

  const [plate, setPlate] = useState("");

  const [originalPlate, setOriginalPlate] = useState(null); // Store the original plate

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(event.target.value);
    if (query === "") {
      setFilteredOrders([]); // Reset to show all data
    } else {
      const filtered = item.filter((item) => {
        const courierName = item.rider ? item.rider.toLowerCase() : "";
        const vehicle = item.vehicle_type
          ? item.vehicle_type.toLowerCase()
          : "";
        const vehicle_plate = item.vehicle_plate
          ? item.vehicle_plate.toLowerCase()
          : "";

        return (
          courierName.includes(query) ||
          vehicle.includes(query) ||
          vehicle_plate.includes(query)
        );
      });
      setFilteredOrders(filtered);
    }
    setCurrentPage(1);
  };

  const fetchCouriers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/get_couriers`);

      if (res.data.status === "success") {
        if (Array.isArray(res.data.res)) {
          setCouriersArr(res.data.res);
          setItem(res.data.res);
        } else {
          setCouriersArr([]); // If it's not an array, set an empty array
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
    setRider("");
    setVehicleType("");
    setVehiclePlate("");
    setAddModal(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${apiUrl}/add-vehicle`,
        {
          rider,
          vehicle_type: vehicleType,
          vehicle_plate: vehiclePlate,
        },
        {
          // Allow 400 response status to be handled as a normal response
          validateStatus: (status) => {
            return status < 500; // allows 400 and 200 statuses
          },
        }
      );

      if (res.status === 400) {
        toast.error(res.data.message); // Show error message if vehicle already exists
      } else if (res.status === 201) {
        resetFields();
        toast.success("Vehicle added successfully.");
      }
    } catch (error) {
      // Handle other errors (network issues, server issues, etc.)
      console.error("Error adding vehicle:", error);
      toast.error("Error adding vehicle. Please try again.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(
        `${apiUrl}/edit-vehicle`,
        {
          ...vehicleData,
          original_plate: originalPlate, // Send the original plate to backend for validation
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

        // Optionally update the vehicle in the list (depending on how you manage state)
        // Example:
        // setCouriersArr(prevState => prevState.map(item =>
        //   item.vehicle_plate === vehicleData.vehicle_plate ? { ...item, ...vehicleData } : item
        // ));
      }
    } catch (error) {
      console.error("Error editing vehicle:", error);
      toast.error("Error editing vehicle. Please try again.");
    }
  };

  const handleDelete = async (e) => {
    try {
      const res = await axios.delete(`${apiUrl}/delete-vehicle`, {
        data: { vehicle_plate: plate }, // Send the vehicle_plate in the request body
      });

      if (res.status === 200) {
        toast.success(res.data.message);
        fetchCouriers();
        closeDeleteModal(); // Close modal after successful deletion
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Error deleting vehicle. Please try again.");
    }
  };

  const openEditModal = (courier) => {
    setVehicleData({
      rider: courier.rider,
      vehicle_type: courier.vehicle_type,
      vehicle_plate: courier.vehicle_plate,
    });
    setOriginalPlate(courier.vehicle_plate);
    setEditModal(true);
  };

  const closeEditModal = () => {
    setEditModal(false);
  };

  const openDeleteModal = (plate) => {
    setPlate(plate);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSearchQuery("");
    setPlate("");
    setDeleteModal(false);
  };

  useEffect(() => {
    if (!searchQuery) {
      fetchCouriers();
    }
  }, [couriersArr, searchQuery]);

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-start">
          <h4>
            <strong style={{ color: "gray" }}>Courier</strong>
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
                  <th>Courier Name</th>
                  <th>Vehicle</th>
                  <th>Vehicle Plate</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {couriersArr?.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <strong>.....</strong>
                    </td>
                  </tr>
                ) : (
                  currentItems?.map((couriersArr, index) => (
                    <tr key={index}>
                      <td className="w-25 text-start align-middle">
                        {couriersArr.rider}
                      </td>
                      <td className="text-start align-middle">
                        {couriersArr.vehicle_type}
                      </td>
                      <td className="text-start align-middle">
                        {couriersArr.vehicle_plate}
                      </td>

                      <td className="align-middle">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <button
                            className="edit-btn"
                            onClick={() => openEditModal(couriersArr)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            className="done-btn"
                            style={{ backgroundColor: "red" }}
                            onClick={() => {
                              openDeleteModal(couriersArr.vehicle_plate);
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
      {showProd && (
        <div className="modal-overlay">
          <div className={`${style["modalContent"]} d-flex flex-column w-100`}>
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Products</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={(e) => setShowProd(false)}
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
                    {prodArr?.length === 0 ? (
                      <tr>
                        <td colSpan="6">NO PRODUCTS FOUND.</td>
                      </tr>
                    ) : (
                      prodArr?.map((prodArr, index) => (
                        <tr key={index}>
                          <td className="w-25 text-start align-middle">
                            {prodArr.item_name}
                          </td>
                          <td className="w-25 text-start align-middle">
                            {prodArr.description}
                          </td>
                          <td className="align-middle">
                            {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(prodArr.price)}
                          </td>
                          <td className="w-25 text-start align-middle">
                            {prodArr.quantity}
                          </td>
                          <td className="align-middle">
                            {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(prodArr.total_price)}
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
      {addModal && (
        <div className="modal-overlay">
          <div className={`${style["modalConfirm"]} d-flex flex-column w-25`}>
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Add Courier</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={(e) => resetFields()}
              ></button>
            </div>

            <div className="overflow-hidden mt-2 ">
              <form
                className="d-flex flex-column gap-3"
                onSubmit={handleSubmit}
              >
                <div>
                  {" "}
                  <span>Name:</span>
                  <input
                    type="text"
                    placeholder="Enter courier name"
                    className="form-control"
                    value={rider}
                    onChange={(e) => setRider(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <span>Vehicle:</span>
                  <input
                    type="text"
                    placeholder="Enter vehicle"
                    className="form-control"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <span>Vehicle Plate:</span>
                  <input
                    type="text"
                    placeholder="Enter plate"
                    className="form-control"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    required
                  />
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
            <div class="modal-header d-flex w-100 justify-content-between">
              <h5>
                <strong>Edit courier</strong>
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                onClick={(e) => closeEditModal()}
              ></button>
            </div>

            <div className="overflow-hidden mt-2 ">
              <form
                className="d-flex flex-column gap-2 "
                onSubmit={handleEditSubmit}
              >
                <div>
                  <label>Courier Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={vehicleData.rider}
                    onChange={(e) =>
                      setVehicleData({ ...vehicleData, rider: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label>Vehicle Type:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={vehicleData.vehicle_type}
                    onChange={(e) =>
                      setVehicleData({
                        ...vehicleData,
                        vehicle_type: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label>Vehicle Plate:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={vehicleData.vehicle_plate}
                    onChange={(e) =>
                      setVehicleData({
                        ...vehicleData,
                        vehicle_plate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn"
                    style={{ color: "#000", backgroundColor: "white" }}
                    onClick={closeEditModal}
                  >
                    Cancel
                  </button>
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
              <strong>Are you sure you want to delete this courier?</strong>
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
