import { useState, useEffect } from "react";

import axiosInstance from "../axiosInstance";

const Register = ({ setSentEmailId }) => {
  const [credentials, setCredentials] = useState({
    emailId: "",
    password: "",
  });

  const [isEmailExists, setIsEmailExists] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/register", credentials);
      if (response.status === "OK") {
        setSentEmailId(credentials.emailId);
      } else if (response.status === "EMAIL_ALREADY_EXISTS") {
        setIsEmailExists(true);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (isEmailExists)
      setTimeout(() => {
        setIsEmailExists(false);
      }, 3000);
  }, [isEmailExists]);

  return (
    <form onSubmit={handleRegister}>
      {isEmailExists && <p className="text-warning">Email already exists.</p>}
      <div className="form-floating mb-3">
        <input
          type="email"
          className="form-control"
          placeholder="name@example.com"
          value={credentials.emailId}
          onChange={(e) =>
            setCredentials((prev) => ({
              ...prev,
              emailId: e.target.value,
            }))
          }
          required
        />
        <label for="floatingInput">Email address</label>
      </div>
      <div className="form-floating">
        <input
          type="password"
          className="form-control"
          placeholder="Password"
          autocomplete="off"
          value={credentials.password}
          onChange={(e) =>
            setCredentials((prev) => ({
              ...prev,
              password: e.target.value,
            }))
          }
          required
        />
        <label for="floatingPassword">Password</label>
      </div>
      <div className="d-grid gap-2 mt-3">
        <button type="submit" className="btn btn-lg btn-primary">
          Register
        </button>
      </div>
    </form>
  );
};

export default Register;
