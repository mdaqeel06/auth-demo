import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../appContext";
import axiosInstance from "../axiosInstance";
import Loader from "../Loader";

const EmailTokenValidator = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isInvalid, setIsInvalid] = useState(false);

  const { handleUserInfo } = useContext(AppContext);
  useEffect(() => {
    const handleVerification = async () => {
      const queryParams = new URLSearchParams(location.search);
      const extractedToken = queryParams.get("token");
      if (extractedToken) {
        try {
          const response = await axiosInstance.post("/verify-email", {
            token: extractedToken,
          });
          if (response.status === "OK") {
            await handleUserInfo();
            navigate("/");
          } else {
            setIsInvalid(true);
          }
        } catch (error) {
          console.error(error);
        }
      }
    };
    handleVerification();
  }, []);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
      {isInvalid ? (
        <p className="text-danger">
          Verification failed: invalid or expired token.
        </p>
      ) : (
        <>
          <Loader className={"mb-3"} />
          <p>
            Thanks! We're just verifying your email — this will only take a
            moment.
          </p>
        </>
      )}
    </div>
  );
};

export default EmailTokenValidator;
