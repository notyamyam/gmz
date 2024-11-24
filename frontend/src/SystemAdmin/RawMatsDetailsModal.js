import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/AddItemModal.css"; // You can style your modal here
import apiUrl from "../ApiUrl/apiUrl";

function RawMatsDetailsModal({ isOpen, onClose, rawMat }) {
  const [RawMatsDetails, setRawMatsDetails] = useState([]);

  useEffect(() => {
    if (isOpen && rawMat) {
      fetchRawMatsDetails(rawMat.matId); // Fetch RawMatsDetails when the modal is opened and an rawMat is selected
    }
  }, [isOpen, rawMat]);

  const fetchRawMatsDetails = async (matId) => {
    try {
      const response = await axios.get(`${apiUrl}/rawmatsinv/${matId}`);
   
      setRawMatsDetails(response.data);
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  if (!isOpen || !rawMat) {
    return null; // Don't render the modal if it is not open or no rawMat is selected
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Raw Materials Details for {rawMat.matName}</h2>
        <table className="modal-table">
          <thead>
            <tr>
          
              <th>Batch ID</th>
              <th>Remaining Quantity</th>
              <th>Received Quantity</th>
              <th>Date Ordered</th>
              <th>Date Received</th>
            </tr>
          </thead>
          <tbody>
            {RawMatsDetails.map((detail, index) => (
              <tr key={index}>
                <td>{"Batch#" + detail.orderItemId}</td>
                <td>{detail.remaining_quantity}</td>
                <td>{detail.ReceivedQuantity}</td>
                <td>{new Date(detail.dateOrdered).toLocaleDateString()}</td>
                <td>{new Date(detail.ReceivedDate)?.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default RawMatsDetailsModal;
