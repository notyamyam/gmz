import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation after registration
import axios from "axios";
import apiUrl from "../ApiUrl/apiUrl"; // Ensure this is correctly imported
import { toast } from "react-toastify"; // For displaying notifications

const RegisterPortal = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      username: username,
      password: password,
      name: name,
      location: location,
    };

    try {
      const response = await axios.post(`${apiUrl}/register`, userData);

      if (response.data.message === "User registered successfully") {
        toast.success("Registration successful!");
        navigate("/"); // Redirect to login page after successful registration
      }
    } catch (err) {
      toast.error("Error registering user. Please try again.");
    }
  };

  return (
    <div className="background">
      <div className="login-container">
        <div className="box-login">
          <div className="left-div">
            <h2>Register</h2>
            <div className="form-container">
              <form onSubmit={handleSubmit}>
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="input-container">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
                <input type="submit" value="Register" />
                <a href="/" class="btn-done">Already have an account? Login here</a>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPortal;
