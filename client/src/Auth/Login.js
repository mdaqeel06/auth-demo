import { useState, useEffect, useContext } from "react";
import { AppContext } from "../appContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";

const Login = () => {
  const { handleUserInfo } = useContext(AppContext);

  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    emailId: "",
    password: "",
  });

  const [isValid, setIsValid] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/login", credentials);
      if (response.status === "OK") {
        await handleUserInfo();
        navigate("/");
      } else if (response.status === "INVALID_CREDENTIALS") {
        setIsValid(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!isValid) {
      setTimeout(() => {
        setIsValid(true);
      }, 3000);
    }
  }, [isValid]);

  return (
    <form onSubmit={handleLogin}>
      {!isValid && <p className="text-danger">Email or password is incorrect.</p>}
      <div className="form-floating mb-3">
        <input
          type="email"
          className="form-control"
          id="floatingInput"
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
          id="floatingPassword"
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
          Login
        </button>
      </div>
    </form>
  );
};

export default Login;
