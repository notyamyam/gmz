import React, { useState } from "react";
import "../css/AddItemModal.css";

const AddAccountModal = ({ isOpen, onClose, onAdd }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username || !password || !role) {
      alert("All fields are required!");
      return;
    }

    const newAccount = {
      username,
      password,
      access: role, // Role corresponds to `access` in your main component
    };

    onAdd(newAccount); // Call the `onAdd` function passed as a prop
    onClose(); // Close the modal
    setUsername("");
    setPassword("");
    setRole("");
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="role-selection">
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select a Role</option>
              <option value="1">System Admin</option>
              <option value="2">System Data</option>
              <option value="3">System Sales</option>
              <option value="4">Customer</option>
            </select>
          </div>
          <div className="modal-buttons">
            <button type="submit">Add Account</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;
