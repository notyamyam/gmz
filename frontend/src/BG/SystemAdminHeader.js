
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser } from "@fortawesome/free-solid-svg-icons";
import apiUrl from "../ApiUrl/apiUrl";

function Header() {
  const navigate = useNavigate();
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
  const notificationDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${apiUrl}/documents/notifications`);
 
      setNotifications(response.data);
      setUnreadCount(response.data.length); // Assuming all are unread initially
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  useEffect(() => {
   
    fetchNotifications();
  }, [notifications]);

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
            console.log("Notification button clicked!");
            setNotificationOpen(!isNotificationOpen);
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

        {/* Notification Dropdown */}
        <div
          className={`dropdown-notif ${isNotificationOpen ? "open" : ""}`}
          ref={notificationDropdownRef}
        >
          {isNotificationOpen && notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <a
                key={index}
                href="#"
                onClick={() => {
                  setUnreadCount(unreadCount - 1); // Adjust unread count
                }}
              >
                <strong>{notif.documentName}</strong> ({notif.category}) - Expiring on{" "}
                {notif.expirationDate}
              </a>
            ))
          ) : (
            <span>No new notifications</span>
          )}
        </div>

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
    </div>
  );
}

export default Header;