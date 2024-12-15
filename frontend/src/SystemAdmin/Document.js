import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap
import "../css/style.css";
import Header from "../BG/SystemAdminHeader";
import Sidebar from "../BG/SystemAdminSidebar";
import axios from "axios";
import AddDocumentModal from "./AddDocumentModal";
import DeleteModal from "./DeleteModal";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import apiUrl from "../ApiUrl/apiUrl";
import moment from "moment";
import ViewPDFModal from "./ViewPdfModal";
import EditDocumentModal from "./EditDocumentModal";

function Document() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [expiredDocuments, setExpiredDocuments] = useState([]); // State for expired documents
  const [isExpiredModalOpen, setExpiredModalOpen] = useState(false); // State to control expired documents modal
  const [isViewModalOpen, setViewModalOpen] = useState(false); // State to control view modal
  const [pdfFilePath, setPdfFilePath] = useState(""); // Store the file path of the PDF
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [searchQuery, setSearchQuery] = useState(""); // New state for search input
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const itemsPerPage = 10; // Items per page
  // Fetch all documents
  const fetchDocuments = async () => {
    try {
      await axios
        .get(`${apiUrl}/documents`)
        .then((res) => {
          setDocuments(res.data.filter((doc) => doc.isArchive === 0));
          setExpiredDocuments(
            res.data.filter((doc) => doc.isArchive === 1) // Filter expired documents
          );
        })
        .catch((err) => console.log(err));
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const addDocument = async () => {
    try {
      fetchDocuments();
    } catch (error) {
      console.error("Error adding document:", error);
      toast.error("Failed to add document.");
    }
  };

  const deleteDocument = async () => {
    console.log("=>>>", itemToDelete);
    if (!itemToDelete) {
      toast.error("Please select a document to delete.");
    }
    try {
      await axios.delete(
        `${apiUrl}/documents/${itemToDelete.id}/${
          itemToDelete.documentName
        }/${localStorage.getItem("username")}`
      );
      fetchDocuments();
      setDeleteModalOpen(false);
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
    fetchDocuments();
  };

  const viewPDF = (filePath) => {
    const url = apiUrl.split("/").slice(0, -1).join("/"); // Remove '/api'
    setPdfFilePath(`${url}${filePath}`); // Set the full URL for the PDF
    setViewModalOpen(true); // Open the modal
  };

  // Search filter logic
  const filterDocuments = () => {
    return documents.filter((doc) => {
      const searchLowerCase = searchQuery.toLowerCase();
      return (
        doc.documentName.toLowerCase().includes(searchLowerCase) ||
        doc.category.toLowerCase().includes(searchLowerCase) ||
        doc.description.toLowerCase().includes(searchLowerCase) ||
        moment(doc.dateEffective)
          .format("YYYY-MM-DD")
          .includes(searchLowerCase) ||
        moment(doc.expirationDate)
          .format("YYYY-MM-DD")
          .includes(searchLowerCase)
      );
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(filterDocuments().length / itemsPerPage);

  const currentData = filterDocuments().slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-start ">
          <h4>
            <strong style={{ color: "gray" }}>Document</strong>
          </h4>
        </div>
        <div className="info">
          <div className="above-table">
            <div>
              <button
                className="btn btn-primary"
                onClick={() => setAddModalOpen(true)}
              >
                <i className="fa-solid fa-add"></i> Add
              </button>
              <button
                className="btn btn-danger"
                style={{ marginLeft: "10px" }}
                onClick={() => setExpiredModalOpen(true)}
              >
                <i className="fa-solid fa-exclamation-circle"></i> View Expired
              </button>
            </div>
            <div>
              <input
                type="text"
                className="form-control"
                placeholder="Search Documents..."
                value={searchQuery}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearchQuery(e.target.value);
                }}
                style={{ marginTop: "10px", width: "300px" }}
              />
            </div>
          </div>
          <div className="t-head">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th style={{ backgroundColor: "red", color: "white" }}>
                    File Name
                  </th>
                  <th style={{ backgroundColor: "red", color: "white" }}>
                    Category
                  </th>
                  <th style={{ backgroundColor: "red", color: "white" }}>
                    Effective Date
                  </th>
                  <th style={{ backgroundColor: "red", color: "white" }}>
                    Expiration Date
                  </th>
                  <th style={{ backgroundColor: "red", color: "white" }}>
                    Description
                  </th>
                  <th style={{ backgroundColor: "red", color: "white" }}>
                    Validity
                  </th>
                  <th style={{ backgroundColor: "red", color: "white" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.documentName}</td>
                    <td>{doc.category}</td>
                    <td>{doc.isNonExpiry == 1? "Not Applicable" : moment(doc.dateEffective)?.format("YYYY-MM-DD")}</td>
                    <td>{doc.isNonExpiry == 1? "Not Applicable" : moment(doc.expirationDate)?.format("YYYY-MM-DD")}</td>
                    <td>{doc.description}</td>
                    <td
                      className="text-center align-middle"
                      style={{ width: "10rem" }}
                    >
                      <span
                        style={{
                          backgroundColor:
                            doc.status === 1 || doc.status === 0
                              ? "red"
                              : "transparent",
                          borderRadius: "10px",
                          color:
                            doc.status === 1 || doc.status === 0
                              ? "white"
                              : "inherit",
                          padding: "5px 10px", // Optional: For better spacing around the text
                        }}
                      >
                        {doc.validity}
                      </span>
                    </td>
                    <td>
                      <div className="docubutton">
                        <div className="btn-group">
                          <button
                            className="done-btn"
                            onClick={() => viewPDF(doc.filePath)}
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <button
                            className="done-btn"
                            style={{ backgroundColor: "red" }}
                            onClick={() => {
                              console.log(doc);
                              setItemToDelete(doc);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                          <button
                            className="edit-btn"
                            onClick={() => editDocument(doc)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expired Documents Modal */}
      <div
        className={`modal fade ${isExpiredModalOpen ? "show d-block" : ""}`}
        tabIndex="-1"
        role="dialog"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Expired Documents</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setExpiredModalOpen(false)}
              ></button>
            </div>
            <div className="modal-body">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Category</th>
                    <th>Expiration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expiredDocuments.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.documentName}</td>
                      <td>{doc.category}</td>
                      <td>{moment(doc.expirationDate).format("YYYY-MM-DD")}</td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="done-btn"
                            onClick={() => {
                              viewPDF(doc.filePath);
                              setExpiredModalOpen(false);
                            }}
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              console.log(doc);
                              setItemToDelete(doc);
                              setDeleteModalOpen(true);
                              setExpiredModalOpen(false);
                            }}
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                          <button
                            className="edit-btn"
                            onClick={() => {
                              setExpiredModalOpen(false);
                              editDocument(doc);
                            }}
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
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setExpiredModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddDocumentModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={addDocument}
      />
      <ViewPDFModal
        isOpen={isViewModalOpen}
        onClose={() => setViewModalOpen(false)}
        document={currentDocument}
        filePath={pdfFilePath}
      />
      <EditDocumentModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onEdit={updateDocument}
        document={currentDocument}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={deleteDocument}
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Document;
