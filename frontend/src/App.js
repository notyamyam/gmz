import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPortal from "./login/LoginPortal";
import SystemAdmin from "./login/SystemAdmin";
import SystemAdminDashboard from "./SystemAdmin/Dashboard";
import SystemAdminDocuments from "./SystemAdmin/Document";
import SystemAdminInventory from "./SystemAdmin/inventory";
import SystemAdminRawMaterials from "./SystemAdmin/RawMats";
import SystemAdminSupplier from "./SystemAdmin/Supplier";
import SystemAdminAccountRoles from "./SystemAdmin/AccountRoles.js";
import Tags from "./SystemAdmin/CategoryTable";

import DataAdmin from "./login/DataAdmin";
import DataAdminDashboard from "./DataAdmin/Dashboard";
import DataAdminInventory from "./DataAdmin/inventory";
import DataAdminRawMats from "./DataAdmin/RawMats";
import DataAdminSupplier from "./DataAdmin/Supplier";
import DataAdminSupplyDelivery from "./DataAdmin/SupplyDeliveries";
import DataAdminProduction from "./DataAdmin/Production";
import DataAdminProductionMaterialsLogs from "./DataAdmin/ProductionMaterialsLog.js";

import SalesAdmin from "./login/SalesAdmin";
import SalesAdminDashboard from "./SalesAdmin/Dashboard";
import SalesAdminOrder from "./SalesAdmin/Order";
import PerparingOrders from "./SalesAdmin/PreparingOrders.js";
import DeliveryOrders from "./SalesAdmin/DeliveryOrder.js";
import Sales from "./SalesAdmin/Sales.js";
import Cancelled from "./SalesAdmin/Cancelled.js";

import CustomerDashboard from "./Customer/Dashboard.js";
import CustomerOrders from "./Customer/Orders.js";
import CustomerHistory from "./Customer/History.js";

const App = () => {
  const [userAccess, setUserAccess] = useState(null);

  useEffect(() => {
    // Retrieve access level from localStorage only once when the component mounts
    const access = localStorage.getItem("access");
    setUserAccess(access);
  }, []);

  // Function to protect routes based on user access level
  const ProtectedRoute = ({ element, requiredAccess }) => {
    if (userAccess === null) {
      // If user access is not set (user not logged in), redirect to login
      return <Navigate to="/" />;
    }

    if (userAccess !== requiredAccess) {
      // If user doesn't have the required access, redirect to login
      return <Navigate to="/" />;
    }

    return element;
  };

  // Function to render dashboard based on userAccess
  const renderDashboard = () => {
    if (userAccess === "1") {
      return <SystemAdminDashboard />;
    } else if (userAccess === "2") {
      return <DataAdminDashboard />;
    } else if (userAccess === "3") {
      return <SalesAdminDashboard />;
    } else if (userAccess === "4") {
      return <CustomerDashboard />;
    }
    return <Navigate to="/" />; // Default redirect if access level is invalid
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Login page should only be accessible if no access token is found */}
          <Route
            path="/"
            element={
              userAccess === null ? (
                <LoginPortal />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />

          {/* Protected routes for System Admin (access === 1) */}
          <Route
            path="/system-admin"
            element={
              <ProtectedRoute element={<SystemAdmin />} requiredAccess="1" />
            }
          />
          <Route
            path="/system-admin/dashboard"
            element={
              <ProtectedRoute
                element={<SystemAdminDashboard />}
                requiredAccess="1"
              />
            }
          />
          <Route
            path="/system-admin/document"
            element={
              <ProtectedRoute
                element={<SystemAdminDocuments />}
                requiredAccess="1"
              />
            }
          />
          <Route
            path="/system-admin/inventory"
            element={
              <ProtectedRoute
                element={<SystemAdminInventory />}
                requiredAccess="1"
              />
            }
          />
          <Route
            path="/system-admin/raw-material"
            element={
              <ProtectedRoute
                element={<SystemAdminRawMaterials />}
                requiredAccess="1"
              />
            }
          />
          <Route
            path="/system-admin/supplier"
            element={
              <ProtectedRoute
                element={<SystemAdminSupplier />}
                requiredAccess="1"
              />
            }
          />
          <Route
            path="/system-admin/account"
            element={
              <ProtectedRoute
                element={<SystemAdminAccountRoles />}
                requiredAccess="1"
              />
            }
          />
          <Route
            path="/system-admin/tags"
            element={<ProtectedRoute element={<Tags />} requiredAccess="1" />}
          />

          {/* Protected routes for Data Admin (access === 2) */}
          <Route
            path="/data-admin"
            element={
              <ProtectedRoute element={<DataAdmin />} requiredAccess="2" />
            }
          />
          <Route
            path="/data-admin/dashboard"
            element={
              <ProtectedRoute
                element={<DataAdminDashboard />}
                requiredAccess="2"
              />
            }
          />
          <Route
            path="/data-admin/product"
            element={
              <ProtectedRoute
                element={<DataAdminInventory />}
                requiredAccess="2"
              />
            }
          />
          <Route
            path="/data-admin/raw-material"
            element={
              <ProtectedRoute
                element={<DataAdminRawMats />}
                requiredAccess="2"
              />
            }
          />
          <Route
            path="/data-admin/supplier"
            element={
              <ProtectedRoute
                element={<DataAdminSupplier />}
                requiredAccess="2"
              />
            }
          />
          <Route
            path="/data-admin/supply-delivery"
            element={
              <ProtectedRoute
                element={<DataAdminSupplyDelivery />}
                requiredAccess="2"
              />
            }
          />
          <Route
            path="/data-admin/production"
            element={
              <ProtectedRoute
                element={<DataAdminProduction />}
                requiredAccess="2"
              />
            }
          />
          <Route
            path="/data-admin/production-material-logs"
            element={
              <ProtectedRoute
                element={<DataAdminProductionMaterialsLogs />}
                requiredAccess="2"
              />
            }
          />

          {/* Protected routes for Sales Admin (access === 3) */}
          <Route
            path="/sales-admin"
            element={
              <ProtectedRoute element={<SalesAdmin />} requiredAccess="3" />
            }
          />
          <Route
            path="/sales-admin/dashboard"
            element={
              <ProtectedRoute
                element={<SalesAdminDashboard />}
                requiredAccess="3"
              />
            }
          />
          <Route
            path="/sales-admin/order"
            element={
              <ProtectedRoute
                element={<SalesAdminOrder />}
                requiredAccess="3"
              />
            }
          />
          <Route
            path="/sales-admin/preparing"
            element={
              <ProtectedRoute
                element={<PerparingOrders />}
                requiredAccess="3"
              />
            }
          />
          <Route
            path="/sales-admin/on-delivery"
            element={
              <ProtectedRoute element={<DeliveryOrders />} requiredAccess="3" />
            }
          />
          <Route
            path="/sales-admin/sales"
            element={<ProtectedRoute element={<Sales />} requiredAccess="3" />}
          />
          <Route
            path="/sales-admin/cancelled"
            element={
              <ProtectedRoute element={<Cancelled />} requiredAccess="3" />
            }
          />

          {/* Route for user-specific dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                element={renderDashboard()}
                requiredAccess={userAccess}
              />
            }
          />

          {/* CUSTOMER */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute
                element={<CustomerDashboard />}
                requiredAccess="4"
              />
            }
          />

          <Route
            path="/customer/orders"
            element={
              <ProtectedRoute element={<CustomerOrders />} requiredAccess="4" />
            }
          />

          <Route
            path="/customer/history"
            element={
              <ProtectedRoute
                element={<CustomerHistory />}
                requiredAccess="4"
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
