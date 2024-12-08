import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link from react-router-dom
import "../css/loginportal.css"; // Import your existing CSS file
import logo from "../icons/gmz.png"; // Import your logo image
import userIcon from "../icons/user.svg"; // Adjust path to your user icon
import passIcon from "../icons/pass.svg"; // Adjust path to your password icon
import apiUrl from "../ApiUrl/apiUrl";
import axios from "axios";
import { toast } from "react-toastify";
const LoginPortal = () => {
  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const credentials = { username: username, password: password };

    axios
      .post(`${apiUrl}/login`, credentials)
      .then((res) => {

        if (res.data.user.access === 1) {
          navigate("/system-admin/dashboard");
        } else if (res.data.user.access === 2) {
          navigate("/data-admin/dashboard");
        } else if (res.data.user.access === 3) {
          navigate("/sales-admin/dashboard");
        }

        localStorage.setItem('id' , res.data.user.id);
        localStorage.setItem('username' , res.data.user.username);
        localStorage.setItem('access' , res.data.user.access);

        window.location.reload();
      })
      .catch((err) => {
        alert("Credential Incorrect.");
      });

    // if (username === 'admin' && password === 'admin') {
    //   navigate('/data-admin/dashboard'); // Redirect on successful login
    // } else {
    //   alert('Invalid username or password'); // Alert for invalid credentials
    // }
  };

  return (
    <div className="background">
      <div className="login-container">
        <div className="box-login">
          <div className="left-div">
            <img className="logo" src={logo} alt="Logo" />
            <h2>Login</h2>
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
                  
                <br />
                <input type="submit" value="Login" />
                <a href="/register" class="btn-done" >Register here</a>
              </form>
            </div>
          </div>
        </div>
        {/* <Link to="/system-admin" className="button">Login as System Admin</Link>
          <Link to="/data-admin" className="button">Login as Data Admin</Link>
          <Link to="/sales-admin" className="button">Login as Sales Admin</Link> */}
      </div>
    </div>
  );
};

export default LoginPortal;
