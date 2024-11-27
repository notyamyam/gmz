// ViewPDFModal.js
import React from "react";
import "../css/style.css"; // Add styles for modal if necessary

const ViewPDFModal = ({ isOpen, onClose, document ,filePath }) => {
  if (!isOpen) return null;
  console.log(">>",document);
  return (
    <div className="modal-overlay">
      <div className="modal-pdf">
        <div className="headercon">
          <h2>View Document</h2>
          <button onClick={onClose} className="close-btn">
            &times;
          </button>
        </div>
        <div className="pdf-viewer">
          <embed
            src={filePath}
            width="100%"
            height="600px"
            type="application/pdf"
          />
        </div>
      </div>
    </div>
  );
};

export default ViewPDFModal;
