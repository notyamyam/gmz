import React, { useEffect, useState } from "react";
import "../css/style.css";
import Header from "../BG/SystemAdminHeader";
import Sidebar from "../BG/SystemAdminSidebar";
import axios from "axios";
import AddDocumentModal from "./AddDocumentModal";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import apiUrl from "../ApiUrl/apiUrl";
import moment from "moment";
import ViewPDFModal from "./ViewPdfModal";
import EditDocumentModal from "./EditDocumentModal";

function Document() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isViewModalOpen, setViewModalOpen] = useState(false); // State to control view modal
  const [pdfFilePath, setPdfFilePath] = useState(""); // Store the file path of the PDF
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [itemToDelete , setItemToDelete] = useState(null);
  // Fetch all documents
  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${apiUrl}/documents`);
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // Add a new document
  const addDocument = async (newDocument) => {
    try {
      await fetchDocuments(); // Refresh the document list
      toast.success("Document added successfully!");
    } catch (error) {
      console.error("Error adding document:", error);
      toast.error("Failed to add document.");
    }
  };
  // Delete a document
  const deleteDocument = async (id) => {
  
      try {
        await axios.delete(`${apiUrl}/documents/${id}`);
        fetchDocuments();
        toast.success("Document deleted successfully!");
      } catch (error) {
        console.error("Error deleting document:", error);
        toast.error("Failed to delete document.");
      }
    
  };

  const editDocument = (document) => {
    setCurrentDocument(document);
    setEditModalOpen(true);
  };

  const updateDocument = async () => {
    fetchDocuments(); // Refresh documents after editing
    toast.success("Document updated successfully!");
  };

  // Open the PDF modal
  const viewPDF = (filePath) => {
    const url = apiUrl.split("/").slice(0, -1).join("/"); // Remove '/api'
    setPdfFilePath(`${url}${filePath}`); // Set the full URL for the PDF
    setViewModalOpen(true); // Open the modal
  };

  useEffect(() => {
    fetchDocuments();
  }, [documents]);

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="page-title">DOCUMENT</div>
        <div className="info">
          <div className="above-table">
            <button className="btn" onClick={() => setAddModalOpen(true)}>
              <i className="fa-solid fa-add"></i> Add
            </button>
          </div>
          <div className="table-list">
            <table>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Category</th>
                  <th>Date Uploaded</th>
                  <th>Expiration Date</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.documentName}</td>
                    <td>{doc.category}</td>
                    <td>{moment(doc.dateUploaded).format("YYYY-MM-DD")}</td>
                    <td>{moment(doc.expirationDate).format("YYYY-MM-DD")}</td>
                    <td>{doc.description}</td>
                    <td>
                      <div className="docubutton">
                        <button
                          className="done-btn"
                          onClick={() => viewPDF(doc.filePath)}
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          className="edit-btn"
                          onClick={() =>{
                            setItemToDelete(doc.id);
                            setDeleteModalOpen(true);
                          }}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                        <button
                          className="btn"
                          onClick={() => editDocument(doc)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddDocumentModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={addDocument}
      />
      {/* View PDF Modal */}
      <ViewPDFModal
        isOpen={isViewModalOpen}
        onClose={() => setViewModalOpen(false)}
        filePath={pdfFilePath} // Pass the file path to the modal
      />
      <EditDocumentModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onEdit={updateDocument}
        document={currentDocument}
      />
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this document?</p>
            <div className="modal-buttons">
              <button
                className="btn"
                onClick={async () => {
                  await deleteDocument(itemToDelete);
                  setDeleteModalOpen(false);
                }}
              >
                Confirm
              </button>
              <button
                className=""
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
       <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Document;
