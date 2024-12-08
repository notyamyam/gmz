import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation after registration
import axios from "axios";
import apiUrl from "../ApiUrl/apiUrl"; // Ensure this is correctly imported

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegisterPortal = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  function resetFields() {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setLocation("");
    setContactNo("");
    setEmail("");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return; // Don't continue with the submission
    }

    const userData = {
      username: username,
      password: password,
      name: name,
      location: location,
      contactNo: contactNo,
      email: email,
    };

    try {
      const response = await axios.post(`${apiUrl}/register`, userData);

      if (response.data.message === "User registered successfully") {
        toast.success("Registration successful!");

        navigate("/"); // Redirect to login page after successful registration
        resetFields();
      }
    } catch (err) {
      console.log(err);
      toast.error("Error registering user. Please try again.");
    }
  };

  return (
    <div className="background">
      <div className="login-container">
        <div className="box-login">
          <div className="left-div">
            <h2>Register</h2>
            <div className="">
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Username"
                  className="form-control mb-2"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  className="form-control mb-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="form-control mb-2"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <input
                  type="text"
                  placeholder="Name"
                  className="form-control mb-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <input
                  type="text"
                  placeholder="Address"
                  className="form-control mb-2"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />

                <input
                  type="number"
                  placeholder="Contact No."
                  className="form-control mb-2"
                  value={contactNo}
                  onChange={(e) => setContactNo(e.target.value)}
                  required
                />

                <input
                  type="email"
                  placeholder="Email"
                  className="form-control mb-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="d-flex w-100 flex-column">
                  <input
                    type="submit"
                    className="btn btn-danger"
                    value={"Register"}
                  />

                  <a href="/" class="btn-done">
                    Already have an account? Login here
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />;
    </div>
  );
};

export default RegisterPortal;
