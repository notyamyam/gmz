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
  // Handles logout
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

  return (
    <div className="header">
      <div>
        Welcome back,<span className="username"> {username}!</span>
      </div>
      <div className="dropdown">
        {/* Notification Button */}
        <button
          type="button"
          className="icon-button"
          id="notificationButton"
          onClick={() => setNotificationOpen(!isNotificationOpen)}
        >
          <FontAwesomeIcon icon={faBell} />
          <span className="icon-button-badge">1</span>
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
        {isNotificationOpen && (
          <div className="dropdown-notif" ref={notificationDropdownRef}>
            <a href="#">Notification 1</a>
            <a href="#">Notification 2</a>
            <a href="#">Notification 3</a>
          </div>
        )}

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
