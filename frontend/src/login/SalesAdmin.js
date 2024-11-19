import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate
import "../css/loginpage.css"; // Import your existing CSS file
import logo from "../icons/gmz.png"; // Import your logo image
import userIcon from "../icons/user.svg"; // Adjust path to your user icon
import passIcon from "../icons/pass.svg"; // Adjust path to your password icon
import { toast } from 'react-toastify';
import axios from "axios";
import apiUrl from "../ApiUrl/apiUrl";
const SalesAdmin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    const credentials = { username: username, password: password };
    axios
      .post(`${apiUrl}/login`, credentials)
      .then((res) => {
        navigate("/sales-admin/dashboard");
      })
      .catch((err) => {
        toast.error('Credential Incorrent.'); 
      });
  };

  return (
    <div className="background">
      <div className="box-login">
        <div className="left-div">
          <img className="logo" src={logo} alt="Logo" />
          <h2>Sales Admin</h2>
          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <div className="input-container">
                <img src={userIcon} alt="Username Icon" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="input-container">
                <img src={passIcon} alt="Password Icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="input-container">
                <input type="checkbox" id="rememberMe" />
                <label htmlFor="rememberMe">Remember me</label>
              </div>
              <br />
              <input type="submit" value="Login" />
            </form>
            <Link to="/" className="back-button">
              Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAdmin;
