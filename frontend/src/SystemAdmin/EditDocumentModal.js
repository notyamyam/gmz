import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/AddItemModal.css";
import apiUrl from "../ApiUrl/apiUrl";
import { toast } from "react-toastify";

const EditDocumentModal = ({ isOpen, onClose, onEdit, document }) => {
  const [documentName, setDocumentName] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [description, setDescription] = useState("");

  // Pre-fill document details when the modal opens
  useEffect(() => {
    if (isOpen && document) {
      setDocumentName(document.documentName);
      setSelectedCategory(document.category);
      setExpirationDate(document.expirationDate);
      setDescription(document.description);

      // Fetch categories
      axios
        .get(`${apiUrl}/categories/document`)
        .then((response) => {
          setCategories(response.data);
        })
        .catch((error) => {
          console.error("Error fetching categories:", error);
        });
    }
  }, [isOpen, document]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
      const filename = file.name.split(".").slice(0, -1).join(".");
      setDocumentName(filename); // Autofill the document name
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("documentName", documentName);
    if (documentFile) {
      formData.append("documentFile", documentFile); // Only append the file if updated
    }
    formData.append("category", selectedCategory);
    formData.append("expirationDate", expirationDate);
    formData.append("description", description);

    try {
      await axios.put(`${apiUrl}/documents/${document.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    
      onEdit(); // Refresh the document list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to update document.");
    }
  };

  if (!isOpen) return null;

  return (
    <div id="editModal" className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Document</h2>
        <form onSubmit={handleSubmit}>
          <label>Document Name</label>
          <input
            type="text"
            placeholder="Document Name"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            disabled={!documentFile} // Allow editing only if a new file is uploaded
            required
          />
           <label>Upload new file</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          <label>Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            required
          >
            <option value="" disabled>
              Select Category
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.categoryName}>
                {cat.categoryName}
              </option>
            ))}
          </select>
          <label>New Expiration Date</label>
          <input
            type="date"
            placeholder="Expiration Date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            required
          />
          <label>Description</label>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
          <hr></hr>
          <button type="submit">Save Changes</button>
          <hr></hr>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditDocumentModal;
