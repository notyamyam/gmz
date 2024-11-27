  import React, { useEffect, useState } from "react";
  import "../css/style.css";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";
  import Header from "../BG/SystemAdminHeader";
  import Sidebar from "../BG/SystemAdminSidebar";
  import SupplierDetailsModal from "./SupplierDetailsModal";
  import DeleteModal from "./DeleteModal";
  import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
  import "@fortawesome/fontawesome-free/css/all.min.css";
  import "react-toastify/dist/ReactToastify.css"; // Import Toastify styles
  import apiUrl from "../ApiUrl/apiUrl";
  import AddAccountModal from "./AddAccountModal";

  function Account() {
    const [accounts, setAccount] = useState([]);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [credentials, setCredentials] = useState([]);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState(0);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({
      key: "supplyName",
      direction: "asc",
    });
    const navigate = useNavigate();

    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/accounts`);
        console.log(response.data);
        setAccount(response.data.user);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch accounts."); // Error toast for fetch
      }
    };

    const addAccount = async (newAccount) => {
      try {
        await axios.post(`${apiUrl}/addaccount`, newAccount);
        fetchData(); // Refresh the account list after adding
        toast.success("Account added successfully!"); // Success toast
      } catch (error) {
        console.error("Error adding account:", error);
        toast.error("Failed to add account."); // Error toast
      }
    };

    const deleteSupplier = async (id) => {
      try {
        await axios.delete(`${apiUrl}/deleteaccount/${id}`); // Adjust route to your delete API
        fetchData(); // Refresh the list
        toast.success("Account deleted successfully!");
      } catch (error) {
        console.error("Error deleting account:", error);
        toast.error("Failed to delete account.");
      }
    };

    const handleDeleteConfirm = async () => {
      if (itemToDelete) {
        await deleteSupplier(itemToDelete.supplyId);
      }
      setDeleteModalOpen(false);
      setItemToDelete(null);
    };

    const confirmDeleteItem = (account) => {
      setItemToDelete(account); // Save account object for deletion
      setDeleteModalOpen(true);
    };

    const editAccount = async (e) => {
      e.preventDefault();

      try {
        await axios.post(`${apiUrl}/editaccount/${credentials.id}`, credentials);
        setEditModalOpen(false);
        fetchData();
        toast.success("Account updated successfully!");
      } catch (error) {
        console.error("Error updating account:", error);
        toast.error("Failed to update account.");
      }
    };

    const handleEditClick = (acc) => {
      setCredentials(acc);
      console.log(acc);
      setEditModalOpen(true);
    };

    const openDetailsModal = (supplier) => {
      setSelectedSupplier(supplier);
      setDetailsModalOpen(true);
    };

    const handleSort = (column) => {
      let direction = "asc";
      if (sortConfig.key === column && sortConfig.direction === "asc") {
        direction = "desc";
      }
      setSortConfig({ key: column, direction });
    };

    const sortedAccount = accounts
      .filter((account) =>
        account.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });

    useEffect(() => {
      fetchData();
    }, []);

    return (
      <div className="container1">
        <Sidebar />
        <Header />
        <div className="main-content">
          <div className="page-title">Accounts</div>
          <div className="info">
            <div className="above-table">
              <div className="above-table-wrapper">
                <button className="btn" onClick={() => setAddModalOpen(true)}>
                  <i className="fa-solid fa-add"></i> Add
                </button>
                <button
                  className="btn"
                  id="sortButton"
                  onClick={() => handleSort("supplyName")}
                >
                  <i className="fa-solid fa-sort"></i> Sort
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
                    placeholder="Search by name or contact..."
                    size="40"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="t-head">
              <table className="table-head">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Password</th>
                    <th>Roles</th>
                    <th>Action</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="table-list">
              <table>
                <tbody>
                  {sortedAccount.map((acc, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{acc.username}</td>
                      <td>{acc.password}</td>
                      <td>
                        {
                          [
                            "System Admin",
                            "System Data",
                            "System Sales",
                            "Customer",
                          ][acc.access - 1]
                        }
                      </td>
                      <td>
                        <div class="docubutton">
                          <button
                            className="edit-btn"
                            onClick={() => handleEditClick(acc)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>

                          <button
                            className="btn"
                            onClick={() => confirmDeleteItem(acc)}
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
          </div>
        </div>
        <AddAccountModal
          isOpen={isAddModalOpen}
          onClose={() => setAddModalOpen(false)}
          onAdd={addAccount}
        />
        {isEditModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Edit Account</h2>
              <form onSubmit={editAccount}>
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Username"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  required
                />
                <label>Password</label>
                <input
                  type="text"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  required
                />
                <div className="role-selection">
                  <label htmlFor="role">Role:</label>
                  <select
                    id="role"
                    value={credentials.access}
                    onChange={(e) =>
                      setCredentials({ ...credentials, access: e.target.value })
                    }
                    required
                  >
                    <option value="" disabled selected>
                      Select a Role
                    </option>
                    <option value="1">System Admin</option>
                    <option value="2">System Data</option>
                    <option value="3">System Sales</option>
                    <option value="4">Customer</option>
                  </select>
                  {credentials.access == "4" && (
                    <>
                
                      <label>Name</label>
                      <input
                      className="form-control"
                        type="text"
                        defaultValue={credentials.customer_name}
                        onChange={(e) =>
                          setCredentials({ ...credentials, name: e.target.value })
                        }
                        required
                      />
                      <label>Location</label>
                      <input
                      className="form-control"
                        type="text"
                        defaultValue={credentials.customer_location}
                        onChange={(e) =>
                          setCredentials({
                            ...credentials,
                            location: e.target.value,
                          })
                        }
                        required
                      />
                    </>
                  )}
                </div>
                <div className="modal-buttons">
                  <button type="submit">Update Account</button>
                  <button type="button" onClick={() => setEditModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Confirm Deletion</h2>
              <p>Are you sure you want to delete this account?</p>
              <div className="modal-buttons">
                <button
                  className="confirm-btn"
                  onClick={async () => {
                    await deleteSupplier(itemToDelete.id); // Adjust the route to match your API
                    setDeleteModalOpen(false);
                  }}
                >
                  Confirm
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  export default Account;
