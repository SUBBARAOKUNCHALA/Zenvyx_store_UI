import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./ProfilePanel.css";

const ProfilePanel = ({ user, firstLetter, onClose }) => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onClose();
    navigate("/login");
  };

  return (
    <>
      <motion.div
        className="profileOverlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Desktop panel */}
      <motion.div
        className="profilePanel desktopProfilePanel"
        initial={{ opacity: 0, y: -16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.96 }}
        transition={{ duration: 0.22 }}
      >
        <div className="profileHeader">
          <div className="profileUserBlock">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt={user.name || "User"}
                className="profileBigImage"
              />
            ) : (
              <div className="profileBigInitial">{firstLetter}</div>
            )}

            <div>
              <h3>{user?.name || "User"}</h3>
              <p>{user?.email || "No email available"}</p>
            </div>
          </div>

          <button className="profileCloseBtn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="profileMenu">
          <button onClick={() => handleNavigate("/my-orders")}>My Orders</button>
          <button onClick={() => handleNavigate("/address")}>My Addresses</button>
          <button onClick={() => handleNavigate("/cart")}>My Cart</button>
         
          <button className="logoutProfileBtn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </motion.div>

      {/* Mobile full screen drawer */}
      <motion.div
        className="profilePanel mobileProfilePanel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.28 }}
      >
        <div className="mobileProfileTop">
          <button className="mobileCloseBtn" onClick={onClose}>
            ←
          </button>
          <h2>My Account</h2>
        </div>

        <div className="mobileProfileUserCard">
          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt={user.name || "User"}
              className="profileBigImage"
            />
          ) : (
            <div className="profileBigInitial">{firstLetter}</div>
          )}

          <div>
            <h3>{user?.name || "User"}</h3>
            <p>{user?.email || "No email available"}</p>
          </div>
        </div>

        <div className="mobileProfileMenu">
          <button onClick={() => handleNavigate("/my-orders")}>My Orders</button>
          <button onClick={() => handleNavigate("/address")}>My Addresses</button>
          <button onClick={() => handleNavigate("/cart")}>My Cart</button>
           <button onClick={() => handleNavigate("/help")}>Help Center</button>
          <button className="logoutProfileBtn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default ProfilePanel;