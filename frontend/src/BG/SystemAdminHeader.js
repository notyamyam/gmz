import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser } from "@fortawesome/free-solid-svg-icons";
import apiUrl from "../ApiUrl/apiUrl";
import moment from "moment"; // Import moment to format dates

function Header() {
  const navigate = useNavigate();
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
  const notificationDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications with a limit of 10
  const fetchNotifications = async () => {
    try {
      await axios.get(`${apiUrl}/documents/notifications`); // Insert notifications into DB (if necessary)
    } catch (error) {
      console.error("Error inserting notifications:", error);
    }

    try {
      const response = await axios.get(
        `${apiUrl}/documents/getnotifications?limit=10`
      );
      setNotifications(response.data);
      setUnreadCount(
        response.data.filter((notif) => notif.status === 0).length
      ); // Count only unread notifications
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Handle logout
  async function handleLogout() {
    try {
      await axios.post(`${apiUrl}/auth/logout`);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  // Handles clicking outside dropdowns to close them
  useEffect(() => {
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

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`${apiUrl}/documents/mark-as-read`, {
        id: notificationId,
      });
      fetchNotifications(); // Refresh notifications after marking as read
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className="header">
      <div>
        Welcome back, <span className="username">{username}!</span>
      </div>
      <div className="dropdown">
        <span className="role">System Admin</span>

        {/* Notification Button */}
        <button
          type="button"
          className="icon-button"
          id="notificationButton"
          onClick={() => {
            setNotificationOpen(true); // Show the modal on click
          }}
        >
          <FontAwesomeIcon icon={faBell} />
          {unreadCount > 0 && (
            <span className="icon-button-badge">{unreadCount}</span>
          )}
        </button>

        {/* User Button */}
        <button
          type="button"
          className="icon-button"
          id="userButton"
          onClick={() => setUserDropdownOpen(!isUserDropdownOpen)}
        >
          <FontAwesomeIcon icon={faUser} />
        </button>

        {/* User Dropdown */}
        {isUserDropdownOpen && (
          <div className="dropdown-user" ref={userDropdownRef}>
            <a href="#">Profile</a>
            <a href="#">Settings</a>
            <a href="#" onClick={handleLogout}>
              Log Out
            </a>
          </div>
        )}
      </div>

      {/* Bootstrap Modal for Notifications */}
      <div
        className={`modal ${isNotificationOpen ? "show" : ""}`}
        tabIndex="-1"
        style={{ display: isNotificationOpen ? "block" : "none" }}
        aria-labelledby="notificationModalLabel"
        aria-hidden={!isNotificationOpen}
      >
        <div className="modal-dialog-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="notificationModalLabel">
                Notifications
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setNotificationOpen(false)} // Close modal
              ></button>
            </div>
            <div className="modal-body">
              {notifications.length > 0 ? (
                notifications.map((notif, index) => (
                  <div
                    key={index}
                    className={`notification-item ${
                      notif.status === 1 ? "read" : "unread"
                    }`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <li
                      style={{
                        fontWeight: notif.status === 1 ? "normal" : "bold",
                        margin: "0",
                        fontSize: "0.8rem", // Reduce font size here
                      }}
                    >
                      {notif.description}
                    </li>

                    {notif.status === 0 && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => markAsRead(notif.id)}
                      >
                        <i className="fa-solid fa-check"></i>
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <span>No new notifications</span>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setNotificationOpen(false)} // Close modal
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
