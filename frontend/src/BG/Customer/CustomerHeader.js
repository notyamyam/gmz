import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../css/style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser } from "@fortawesome/free-solid-svg-icons";
import apiUrl from "../../ApiUrl/apiUrl";

function Header() {
  const navigate = useNavigate();
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
  const notificationDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false); // State for logout modal

  // Handles logout

  // Handles clicking outside dropdowns to close them
  useEffect(() => {
    console.log(username);
    function handleClickOutside(event) {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogoutConfirmation = () => {
    localStorage.clear(); // Clear localStorage
    window.location.reload(); // Reload the page to reset the session
  };

  const handleLogoutCancel = () => {
    setLogoutModalOpen(false); // Close the modal
  };

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  return (
    <div className="header">
      <div>
        Welcome back,<span className="username"> {username}!</span>
      </div>
      <div className="dropdown">
        {/* User Button */}
        <button
          type="button"
          className="icon-button"
          onClick={(e) => {
            handleLogoutClick();
          }}
        >
          <FontAwesomeIcon icon={faUser} />
        </button>
      </div>
      {isLogoutModalOpen && (
        <div className="modal show" tabIndex="-1" style={{ display: "block" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-body">
                <h6>Are you sure you want to log out?</h6>
              </div>
              <div className="d-flex w-100 justify-content-end">
                <button
                  type="button"
                  style={{ backgroundColor: "white", color: "gray" }}
                  onClick={handleLogoutCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ backgroundColor: "red", color: "white" }}
                  onClick={handleLogoutConfirmation}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;
