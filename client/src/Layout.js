import React, { useContext, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { AppContext } from "./appContext";
import Loader from "./Loader";
import Auth from "./Auth";
import EmailTokenValidator from "./Auth/EmailTokenValidator";
import Home from "./Home";

const Layout = () => {
  const { handleRefresh } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  const verifyEmailRoute = window.location.pathname.includes("verify-email");

  const navigate = useNavigate();
  const refreshToken = async () => {
    const response = await handleRefresh();
    if (!response) {
      navigate("/login");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!verifyEmailRoute) {
      refreshToken();
    } else {
      setLoading(false);
    }
  }, []);

  const ProtectedRoute = ({ children }) => {
    return loading ? (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
        <Loader className={"mb-3"} />
        <p>Please wait...</p>
      </div>
    ) : (
      children
    );
  };

  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route path="/verify-email" element={<EmailTokenValidator />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default Layout;
