import React, { useState } from "react";
import { motion } from "framer-motion";
import './Navbar.css';
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLogin = location.pathname === "/login";
  const buttonText = isLogin ? "Register" : "Login";
  const route = isLogin ? "/register" : "/login";

  return (
    <>
      <motion.div
        className="navbar"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* LEFT - LOGO */}
        <div className="logoContainer">
          <strong className="logoText">ZENVYX</strong>
          <span className="subtext">-- We Create Attitude --</span>
        </div>

        {/* CENTER - SEARCH (hidden on mobile) */}
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

        {/* MOBILE HAMBURGER */}
        <div
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </div>
      </motion.div>

      {/* MOBILE DROPDOWN */}
      {menuOpen && (
        <motion.div
          className="mobileMenu"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <input
            type="text"
            placeholder="Search..."
            className="mobileSearch"
          />
          <button
            className="mobileBtn"
            onClick={() => {
              navigate(route);
              setMenuOpen(false);
            }}
          >
            {buttonText}
          </button>
        </motion.div>
      )}
    </>
  );
};

export default Navbar;