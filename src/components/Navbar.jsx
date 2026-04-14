import React from "react";
import { motion } from "framer-motion";
import "./Navbar.css";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isLogin = location.pathname === "/login";
  const buttonText = isLogin ? "Register" : "Login";
  const route = isLogin ? "/register" : "/login";

  return (
    <motion.div
      className="navbar"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* LEFT - LOGO */}
      <div className="logoContainer" onClick={() => navigate("/")}>
        <strong className="logoText">ZENVYX</strong>
        <span className="subtext">-- We Create Attitude --</span>
      </div>

      {/* CENTER - SEARCH */}
      <div className="searchContainer">
        <input
          type="text"
          placeholder="Search..."
          className="searchInput"
        />
      </div>

      {/* RIGHT - DESKTOP BUTTON */}
      <div className="actionsDesktop">
        <button className="navBtn" onClick={() => navigate(route)}>
          {buttonText}
        </button>
      </div>

      {/* RIGHT - MOBILE PROFILE ICON */}
      <div className="profileIconMobile" onClick={() => navigate(route)}>
        <span>👤</span>
      </div>
    </motion.div>
  );
};

export default Navbar;