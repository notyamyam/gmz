import React from "react";
import { Link } from "react-router-dom";
import gmzlogo from "../../icons/gmzlogo.png";
import "../../css/style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faFile,
  faBox,
  faBoxesStacked,
  faAddressBook,
  faUsersLine,
} from "@fortawesome/free-solid-svg-icons";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>
        <img src={gmzlogo} width="85" height="75" alt="Logo" />
      </h2>
      <ul>
        {/* <li>
          <Link to="/customer/dashboard">Dashboard</Link>
        </li> */}
        <li>
          <Link to="/customer/orders">Orders</Link>
        </li>

        <li>
          <Link to="/customer/completed">Completed Orders</Link>
        </li>

        <li>
          <Link to="/customer/declined">Declined Orders</Link>
        </li>

        <li>
          <Link to="/customer/cancelled">Cancelled Orders</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;