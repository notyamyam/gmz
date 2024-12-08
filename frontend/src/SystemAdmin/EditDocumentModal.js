import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/AddItemModal.css";
import "../css/style.css";
import apiUrl from "../ApiUrl/apiUrl";
import { toast } from "react-toastify";

const EditDocumentModal = ({ isOpen, onClose, onEdit, document }) => {
  const [documentName, setDocumentName] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [effectiveDate, setDateEffective] = useState("");
  const [description, setDescription] = useState("");

  const formatDate = (date) => {
    if (!date) return ""; // Handle empty or null dates
    const d = new Date(date);
    return d.toISOString().split("T")[0]; // Extract "YYYY-MM-DD"
  };

  useEffect(() => {
    if (isOpen && document) {
      setDocumentName(document.documentName || "");
      setSelectedCategory(document.category || "");
      setExpirationDate(formatDate(document.expirationDate) || "");
      setDateEffective(formatDate(document.dateEffective) || "");
      setDescription(document.description || "");

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

  const handleArchive = async () => {
    if (!document) return;

    const confirmed = window.confirm(
      `Are you sure you want to ${document.isArchive == 1? 'Unarchive' : 'Archive'} the document "${document.documentName}"?`
    );

    if (!confirmed) return;
    var archiveValue = 0;
    if (document.isArchive == 1) {
      archiveValue = 0;
    } else {
      archiveValue = 1;
    }
    try {
      await axios.put(`${apiUrl}/documents/${document.id}/archive`, {
        ...document,
        archiveValue: archiveValue,
        user: localStorage.getItem("username"),
      });

      toast.success("Document archived successfully!");
      onEdit();
      onClose();
    } catch (error) {
      console.error("Error archiving document:", error);
      toast.error("Failed to archive document.");
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
    formData.append("dateEffective", effectiveDate);
    formData.append("expirationDate", expirationDate);
    formData.append("description", description);

    try {
      await axios.put(`${apiUrl}/documents/${document.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Document updated successfully!");
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
        <div className="headercon">
          <h2>Edit Document</h2>
          <button
            hidden={document.status !== 0}
            className="btn"
            style={{backgroundColor: "orange" , color: "white"}}
            type="button"
            onClick={handleArchive}
          >
            {document.isArchive == 1 ? "Unarchive" : "Archive"}
          </button>
        </div>
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
          <label>New Effective Date</label>
          <input
            type="date"
            placeholder="Effective Date"
            value={effectiveDate}
            onChange={(e) => setDateEffective(e.target.value)}
            required
          />
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
          <hr />
          <button type="submit">Save Changes</button>
          <hr />
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditDocumentModal;
