import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../BG/SystemAdminHeader";
import Sidebar from "../BG/SystemAdminSidebar";
import apiUrl from "../ApiUrl/apiUrl";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap CSS is imported

function CategoryTable() {
  const [categories, setCategories] = useState({
    "Document / Legal / Contract": [],
    Inventory: [],
    RawMaterial: [],
  });
  const [formState, setFormState] = useState({
    id: null,
    categoryName: "",
    type: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    axios
      .get(`${apiUrl}/categories`)
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  };

  const createCategory = () => {
    axios
      .post(`${apiUrl}/categories`, formState)
      .then(() => {
        fetchCategories();
        resetForm();
        setShowModal(false);
      })
      .catch((error) => console.error("Error creating category:", error));
  };

  const updateCategory = () => {
    axios
      .put(`${apiUrl}/categories/${formState.id}`, formState)
      .then(() => {
        fetchCategories();
        resetForm();
        setShowModal(false);
      })
      .catch((error) => console.error("Error updating category:", error));
  };

  const deleteCategory = (id) => {
    axios
      .delete(`${apiUrl}/categories/${id}`)
      .then(() => {
        fetchCategories();
      })
      .catch((error) => console.error("Error deleting category:", error));
  };

  const editCategory = (category) => {
    setFormState(category);
    setIsEditing(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormState({ id: null, categoryName: "", type: "" });
    setIsEditing(false);
  };

  const renderTable = (categories, type) => (
    <div className="mb-5">
      <h4 className="mb-3">{type}   </h4>
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr >
            <th>#</th>
            <th>Category Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center">
                No {type.toLowerCase()} categories available
              </td>
            </tr>
          ) : (
            categories.map((category, index) => (
              <tr key={category.id}>
                <td>{index + 1}</td>
                <td>{category.categoryName}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => editCategory(category)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteCategory(category.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container1">
      <Sidebar />
      <Header />
      <div className="main-content">
        <div className="container-fluid">
          <div className="d-flex justify-content-between mb-3">
            <h3>Categories</h3>
            <button
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              Add Category
            </button>
          </div>
          {Object.keys(categories).map((type) =>
            renderTable(categories[type], type)
          )}
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditing ? "Edit Category" : "Add Category"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    isEditing ? updateCategory() : createCategory();
                  }}
                >
                  <div className="mb-3">
                    <label className="form-label">Category Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter category name"
                      value={formState.categoryName}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          categoryName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category Type</label>
                    <select
                      className="form-select"
                      value={formState.type}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          type: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Document">Document</option>
                      <option value="Legal">Legal</option>
                      <option value="Contract">Contract</option>
                      <option value="Inventory">Inventory</option>
                      <option value="RawMaterial">Raw Material</option>
                    </select>
                  </div>
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {isEditing ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryTable;
