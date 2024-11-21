import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/AddItemModal.css";
import apiUrl from "../ApiUrl/apiUrl";
import { toast } from "react-toastify";

const AddDocumentModal = ({ isOpen, onClose, onAdd }) => {
  const [documentName, setDocumentName] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dateUploaded, setDateUploaded] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [description, setDescription] = useState("");

  // Fetch inventory categories from backend when the modal opens
  useEffect(() => {
    if (isOpen) {
      axios
        .get(`${apiUrl}/categories/document`)
        .then((response) => {
          setCategories(response.data);
        })
        .catch((error) => {
          console.error("Error fetching inventory categories:", error);
        });
    }
  }, [isOpen]);

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

    if (!documentFile) {
      alert("Please upload a document.");
      return;
    }

    const formData = new FormData();
    formData.append("documentName", documentName);
    formData.append("documentFile", documentFile);
    formData.append("category", selectedCategory);
    formData.append("dateUploaded", dateUploaded);
    formData.append("expirationDate", expirationDate);
    formData.append("description", description);

    await axios
      .post(`${apiUrl}/documents/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        toast.success("Document uploaded successfully!");
        console.log(res);
        onClose();
      })
      .catch((error) => {
        console.error("Error uploading document:", error);
        alert(error.response.data.error);
      });
  };

  if (!isOpen) return null;

  return (
    <div id="addModal" className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Document</h2>
        <form onSubmit={handleSubmit}>
          <label>File Name</label>
          <input
            type="text"
            placeholder="Document Name"
            disabled
            value={documentName}
            required
          />
          <label>Upload File</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            required
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
          <label>Date Uploaded</label>
          <input
            type="date"
            placeholder="Date Uploaded"
            value={dateUploaded}
            onChange={(e) => setDateUploaded(e.target.value)}
            required
          />
          <label>Date expiry</label>
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
          <button type="submit">Add Document</button>
          <hr></hr>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDocumentModal;
