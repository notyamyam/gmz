import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser } from "@fortawesome/free-solid-svg-icons";
import apiUrl from "../ApiUrl/apiUrl";
function Header() {
  const navigate = useNavigate();
  const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
  const notificationDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false); // State for logout modal

  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [notifArr, setNotifArr] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Handles logout
  // async function handleLogout() {
  //   try {
  //     await axios.post(`${apiUrl}/auth/logout`);
  //     navigate("/");
  //   } catch (error) {
  //     console.error("Error logging out:", error);
  //   }
  // }

  // Handles clicking outside dropdowns to close them
  useEffect(() => {
    fetchNotif();
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
  }, [notifArr]);

  const fetchNotif = async () => {
    try {
      const res = await axios.get(`${apiUrl}/fetch_notif`);
      if (res.data.status === "success") {
        console.log(res.data);
        if (Array.isArray(res.data.res)) {
          setNotifArr(res.data.res);
          setUnreadCount(
            res.data.res.filter((notif) => notif.status === 0).length
          );
        } else {
          setNotifArr([]);
        }
      } else {
        console.log("notif: ", res.data.res);
      }
    } catch (error) {
      console.error("Error occured (fetchNotif): ", error.message);
    }
  };

  //mark as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`${apiUrl}/mark-as-read-notif`, {
        id: notificationId,
      });
      fetchNotif(); // Refresh notifications after marking as read
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

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
        Welcome back,<span className="username">{username}</span>
      </div>
      <div className="dropdown">
        <span className="role">Sales Admin</span>

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
          onClick={(e) => {
            handleLogoutClick();
          }}
        >
          <FontAwesomeIcon icon={faUser} />
        </button>
      </div>

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
              <h5
                className="modal-title"
                id="notificationModalLabel"
                style={{ color: "gray" }}
              >
                <strong>Notifications</strong>
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
              {notifArr.length > 0 ? (
                notifArr.map((notif, index) => (
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
          </div>
        </div>
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
