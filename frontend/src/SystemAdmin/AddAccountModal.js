import React, { useState } from "react";
import "../css/AddItemModal.css";

const AddAccountModal = ({ isOpen, onClose, onAdd }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [credentials, setCredentials] = useState({
    customer_id: "",
    name: "",
    location: "",
  });

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
      ...(role == "4" && credentials), // Include customer data only if role is "Customer"
    };

    onAdd(newAccount); // Call the `onAdd` function passed as a prop
    onClose(); // Close the modal
    setUsername("");
    setPassword("");
    setRole("");
    setCredentials({ customer_id: "", name: "", location: "" }); // Reset credentials
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{ color: "gray" }}>
          <strong>Add New Account</strong>
        </h2>
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
            {role === "4" && (
              <>
                <label>Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={credentials.name}
                  onChange={(e) =>
                    setCredentials({ ...credentials, name: e.target.value })
                  }
                  required
                />
                <label>Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={credentials.location}
                  onChange={(e) =>
                    setCredentials({ ...credentials, location: e.target.value })
                  }
                  required
                />
                <label>Contact No.</label>
                <input
                  type="text"
                  className="form-control"
                  value={credentials.contact_no}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      contact_no: e.target.value,
                    })
                  }
                  required
                />
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  required
                />
              </>
            )}
          </div>
          <div className="d-flex justify-content-end w-100 gap-2">
            <button
              type="button"
              onClick={() => {
                setUsername("");
                setPassword("");
                setRole("");
                setCredentials({ customer_id: "", name: "", location: "" });
                onClose();
              }}
            >
              Cancel
            </button>
            <button type="submit">Add Account</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;
