import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Navbar.css";
import { useNavigate, useLocation } from "react-router-dom";
import ProfilePanel from "../pages/ProfilePanel";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfilePanel, setShowProfilePanel] = useState(false);

  const isLogin = location.pathname === "/login";
  const buttonText = isLogin ? "Register" : "Login";
  const route = isLogin ? "/register" : "/login";

  const token = localStorage.getItem("token");

  const user = useMemo(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  }, [location.pathname, token]);

  const firstLetter =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  const toggleProfilePanel = () => {
    if (!token || !user) {
      navigate(route);
      return;
    }
    setShowProfilePanel((prev) => !prev);
  };

  return (
    <>
      <motion.div
        className="navbar"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="logoContainer" onClick={() => navigate("/")}>
          <strong className="logoText">ZENVYX</strong>
          <span className="subtext">-- We Create Attitude --</span>
        </div>

        <div className="searchContainer">
          <input
            type="text"
            placeholder="Search..."
            className="searchInput"
          />
        </div>

        <div className="actionsDesktop">
          <div className="cartIconWrap" onClick={() => navigate("/cart")}>
            <span className="cartIcon">🛒</span>
          </div>

          {!token || !user ? (
            <button className="navBtn" onClick={() => navigate(route)}>
              {buttonText}
            </button>
          ) : (
            <div className="userSection">
              <div className="userProfileBox" onClick={toggleProfilePanel}>
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.name || "User"}
                    className="userProfileImage"
                  />
                ) : (
                  <div className="userInitialAvatar">{firstLetter}</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mobileRightActions">
          <div
            className="cartIconWrap mobileCartIcon"
            onClick={() => navigate("/cart")}
          >
            <span className="cartIcon">🛒</span>
          </div>

          {!token || !user ? (
            <div className="profileIconMobile" onClick={() => navigate(route)}>
              <span>👤</span>
            </div>
          ) : (
            <div className="profileIconMobile" onClick={toggleProfilePanel}>
              {user?.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.name || "User"}
                  className="mobileUserImage"
                />
              ) : (
                <span className="mobileUserInitial">{firstLetter}</span>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showProfilePanel && user && (
          <ProfilePanel
            user={user}
            firstLetter={firstLetter}
            onClose={() => setShowProfilePanel(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;