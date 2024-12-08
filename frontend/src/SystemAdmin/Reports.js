import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Import the plugin
import html2canvas from "html2canvas";
import apiUrl from "../ApiUrl/apiUrl";
import Header from "../BG/SystemAdminHeader";
import Sidebar from "../BG/SystemAdminSidebar";

const Reports = () => {
  const [reportType, setReportType] = useState("product");
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateRequired, setDateRequired] = useState(false);

  useEffect(() => {
    setDateRequired(
      reportType === "product" ||
        reportType === "sales" ||
        reportType === "documents" ||
        reportType === "rawMaterials"
    ); // Show date range for relevant reports
    fetchReportData();
  }, [reportType, startDate, endDate]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const params =
        reportType === "sales"
          ? { reportType,  startDate, endDate }
          : { reportType, startDate, endDate };
      const response = await axios.get(`${apiUrl}/reports`, { params });
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching report data:", error);
      alert("Error fetching report data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `₱${new Intl.NumberFormat("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)}`;
  };

  const exportToCSV = (fileName, data) => {
    const formattedDate = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .split("T")
      .join("_");
    const headers = Object.keys(data[0] || {}).join(",") + "\n";
    const rows = data
      .map((row) => {
        const rowData = Object.values(row);
        const escapedRowData = rowData.map((value) => {
          if (typeof value === "string") {
            return `"${value.replace(/"/g, '""').replace(/\n/g, "\\n")}"`; // Escape quotes and line breaks
          }
          return value;
        });
        return escapedRowData.join(",");
      })
      .join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}_report_${formattedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const formattedDate = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .split("T")
      .join("_");
    if (!reportData.length) {
      alert("No data to export.");
      return;
    }

    const pdf = new jsPDF();
    const tableHeaders = Object.keys(reportData[0]);
    const tableRows = reportData.map((row) =>
      Object.values(row).map((value) => value)
    );

    pdf.text(`${reportType.toUpperCase()} Report`, 10, 10); // Add a title
    pdf.autoTable({
      head: [tableHeaders], // Header row
      body: tableRows, // Data rows
      startY: 20, // Start table below the title
      theme: "grid", // Adding grid theme for better readability
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
      },
      margin: { top: 15 },
    });

    pdf.save(`${reportType}_report_${formattedDate}.pdf`);
  };

  const exportToPNG = async () => {
    const formattedDate = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .split("T")
      .join("_");
    if (!reportData.length) {
      alert("No data to export.");
      return;
    }

    const tableElement = document.getElementById("report-table");
    if (!tableElement) {
      alert("Table not found.");
      return;
    }

    try {
      const canvas = await html2canvas(tableElement);
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.setAttribute("href", imgData);
      link.setAttribute(
        "download",
        `${reportType}_report_${formattedDate}.png`
      );
      link.click();
    } catch (error) {
      console.error("Error exporting to PNG:", error);
      alert("Failed to export to PNG. Please try again.");
    }
  };

  const handleReportChange = (e) => {
    setReportType(e.target.value);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;

    if (name === "startDate") {
      setStartDate(value);
      if (endDate && new Date(value) > new Date(endDate)) {
        setEndDate(value); // Adjust end date if it was before start date
      }
    } else if (name === "endDate") {
      if (new Date(value) < new Date(startDate)) {
        alert("End date cannot be earlier than start date.");
      } else {
        setEndDate(value);
      }
    }
  };

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="d-flex w-100 justify-content-start">
          <h4>
            <strong style={{ color: "gray" }}>Reports</strong>
          </h4>
        </div>
        <div className="d-flex justify-content-end flex-column mt-2">
          <div className="d-flex w-100 justify-content-end">
            <label>
              <i>Select Report:</i>
            </label>
          </div>

          <select value={reportType} onChange={handleReportChange}>
            <option value="product">Product</option>
            <option value="rawMaterials">Raw Materials</option>
            <option value="documents">Documents</option>
            <option value="sales">Sales</option>
          </select>

          {dateRequired && (
            <div className="date-range">
              <label>Start Date:</label>
              <input
                type="date"
                name="startDate"
                value={startDate}
                onChange={handleDateChange}
              />
              <label>End Date:</label>
              <input
                type="date"
                name="endDate"
                value={endDate}
                onChange={handleDateChange}
              />
            </div>
          )}
        </div>

        {reportData.length > 0 && (
          <>
            <div
              style={{
                marginTop: "5vh",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <h4>
                <strong>Preview:</strong>
              </h4>
              <div className="docubutton">
                <button
                  className="done-btn"
                  onClick={() => exportToCSV(reportType, reportData)}
                >
                  <i className="fa-regular fa-file-excel"></i>
                </button>
                <button className="edit-btn" onClick={exportToPDF}>
                  <i className="fa-regular fa-file-pdf"></i>
                </button>
                <button className="view-btn" onClick={exportToPNG}>
                  <i
                    className="fa-solid fa-image"
                    style={{ color: "white" }}
                  ></i>
                </button>
              </div>
            </div>
            <table id="report-table" className="report-table">
              <thead>
                <tr>
                  {Object.keys(reportData[0]).map((key, index) => (
                    <th key={index}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, index) => (
                  <tr key={index}>
                    {Object.entries(row).map(([key, value], i) => (
                      <td key={i}>
                        {key === "PRICE" || key === "TOTAL"
                          ? formatPrice(value)
                          : value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
