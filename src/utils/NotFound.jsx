// src/pages/NotFound.jsx

import { useNavigate } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="warning-icon">⚠️</div>

        <h2>We couldn't find what you were looking for.</h2>

        <button
          className="reload-btn"
          onClick={() => navigate("/")}
        >
          Go To Home
        </button>
      </div>
    </div>
  );
}

export default NotFound;