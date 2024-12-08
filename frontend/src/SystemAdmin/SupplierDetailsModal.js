import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/AddItemModal.css"; // You can style your modal here
import apiUrl from "../ApiUrl/apiUrl";

function SupplierDetailsModal({ isOpen, onClose, supplier }) {
  const [supplierDetails, setSupplierDetails] = useState([]);

  useEffect(() => {
    if (isOpen && supplier) {
      fetchSupplierDetails(supplier.supplyId);
    }
  }, [isOpen, supplier]);

  const fetchSupplierDetails = async (supplyId) => {
    try {
      const response = await axios.get(`${apiUrl}/supDeli/${supplyId}`);
      setSupplierDetails(response.data);
    } catch (error) {
      console.error("Error fetching supplier details:", error);
    }
  };

  if (!isOpen || !supplier) {
    return null; // Don't render if the modal is not open
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{ color: "gray" }}>
          <strong>Supplier Products for {supplier.supplyName}</strong>
        </h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Material Name</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {supplierDetails.length === 0 ? (
              <tr>
                <td colSpan="3">No products found.</td>
              </tr>
            ) : (
              supplierDetails.map((detail, index) => (
                <tr key={detail.rawMatId}>
                  <td>{index + 1}</td>
                  <td>{detail.matName}</td>

                  <td>
                    {new Intl.NumberFormat("en-PH", {
                      style: "currency",
                      currency: "PHP",
                    }).format(detail.price)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default SupplierDetailsModal;
