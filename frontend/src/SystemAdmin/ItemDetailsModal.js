import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/AddItemModal.css'; // You can style your modal here
import apiUrl from '../ApiUrl/apiUrl';

function ItemDetailsModal({ isOpen, onClose, item }) {
    const [ItemDetails, setItemDetails] = useState([]);

    useEffect(() => {
        if (isOpen && item) {
            fetchItemDetails(item.itemId);
        }
    }, [isOpen, item]);

    const fetchItemDetails = async (itemId) => {
        try {
            const response = await axios.get(`${apiUrl}/inventory-data/${itemId}`);
            setItemDetails(response.data);
        } catch (error) {
            console.error('Error fetching ItemDetails:', error);
        }
    };

    if (!isOpen || !item) {
        return null; // Don't render if the modal is not open
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>ItemDetails for {item.itemName}</h2>
                <table className='modal-table'>
                    <thead>
                        <tr>
                            <td>#</td>
                            <td>Batch ID</td>
                            <th>Quantity</th>
                            <th>Date</th>
                            <th>Last Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ItemDetails.map((detail, index) => (
                            <tr key={detail.inventoryId}>
                                <td>{index + 1}</td>
                                <td>{'Batch#' + detail.inventoryId}</td>
                                <td>{detail.quantity}</td>
                                <td>{new Date(detail.date).toLocaleDateString()}</td>
                                <td>{new Date(detail.lastUpdated).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button type="button" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

export default ItemDetailsModal;
