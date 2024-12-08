import React from "react";
import { Link } from "react-router-dom";
import gmzlogo from "../icons/gmzlogo.png";
import "../css/style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faTruck,
  faBox,
  faChartLine,
  faClipboardList,
  faTimes,
  faCog,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

const Sidebar = () => {
  return (
    <div className="sidebar">
      {/* <h2><img src={gmzlogo} width="85" height="75" alt="Logo" /></h2> */}
      <ul>
        <li>
          <Link to="/sales-admin/dashboard">
            <FontAwesomeIcon icon={faHouse} /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/sales-admin/order">
            <FontAwesomeIcon icon={faClipboardList} /> Orders
          </Link>
        </li>
        <li>
          <Link to="/sales-admin/preparing">
            <FontAwesomeIcon icon={faCog} /> Preparing
          </Link>
        </li>
        <li>
          <Link to="/sales-admin/prepared">
            <FontAwesomeIcon icon={faCog} /> Prepared
          </Link>
        </li>
        <li>
          <Link to="/sales-admin/ready">
            <FontAwesomeIcon icon={faCheck} /> Ready to Pickup
          </Link>
        </li>
        <li>
          <Link to="/sales-admin/delivery">
            <FontAwesomeIcon icon={faTruck} /> Transit
          </Link>
        </li>
        <li>
          <Link to="/sales-admin/sales">
            <FontAwesomeIcon icon={faChartLine} /> Sales
          </Link>
        </li>
        <li>
          <Link to="/sales-admin/declined">
            <FontAwesomeIcon icon={faTimes} /> Declined
          </Link>
        </li>
        <li>
          <Link to="/sales-admin/cancelled">
            <FontAwesomeIcon icon={faTimes} /> Cancelled
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;