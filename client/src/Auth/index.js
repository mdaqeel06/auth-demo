import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import VerifyEmailPrompt from "./VerifyEmailPrompt";

const Auth = () => {
  const [tabIndex, setTabIndex] = useState(1);

  const [sentEmailId, setSentEmailId] = useState(null);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
      {!sentEmailId ? (
        <>
          <ul className="nav nav-tabs mb-3" role="tablist">
            <li className="nav-item" role="presentation">
              <a
                className={`nav-link ${tabIndex === 1 && "active"}`}
                data-bs-toggle="tab"
                aria-selected="true"
                role="tab"
                onClick={() => setTabIndex(1)}
              >
                Login
              </a>
            </li>
            <li className="nav-item" role="presentation">
              <a
                className={`nav-link ${tabIndex === 2 && "active"}`}
                data-bs-toggle="tab"
                aria-selected="false"
                tabindex="-1"
                role="tab"
                onClick={() => setTabIndex(2)}
              >
                Register
              </a>
            </li>
          </ul>

          <div className="tab-content">
            {tabIndex === 1 && (
              <div
                className={`tab-pane fade show ${tabIndex === 1 && "active"}`}
                id="login"
                role="tabpanel"
              >
                <Login />
              </div>
            )}
            {tabIndex === 2 && (
              <div
                className={`tab-pane fade show ${tabIndex === 2 && "active"}`}
                id="register"
                role="tabpanel"
              >
                <Register setSentEmailId={setSentEmailId} />
              </div>
            )}
          </div>
        </>
      ) : (
        <VerifyEmailPrompt sentEmailId={sentEmailId} />
      )}
    </div>
  );
};

export default Auth;
