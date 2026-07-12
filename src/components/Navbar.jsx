import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Navbar.css";
import { useNavigate, useLocation } from "react-router-dom";
import ProfilePanel from "../pages/ProfilePanel";
import { Heart } from "lucide-react";
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [searchText, setSearchText] = useState("");

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlSearch = params.get("search") || "";
    setSearchText(urlSearch);
  }, [location.search]);

  // const handleSearchChange = (e) => {
  //   const value = e.target.value;
  //   setSearchText(value);

  //   const trimmedValue = value.trim();

  //   if (location.pathname !== "/") {
  //     navigate(trimmedValue ? `/?search=${encodeURIComponent(trimmedValue)}` : "/");
  //     return;
  //   }

  //   const params = new URLSearchParams(location.search);

  //   if (trimmedValue) {
  //     params.set("search", trimmedValue);
  //   } else {
  //     params.delete("search");
  //   }

  //   navigate(
  //     {
  //       pathname: "/",
  //       search: params.toString() ? `?${params.toString()}` : "",
  //     },
  //     { replace: true }
  //   );
  // };
  const scrollToProducts = () => {
    setTimeout(() => {
      document
        .getElementById("productsSection")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    const trimmedValue = value.trim();

    if (location.pathname !== "/") {
      navigate(trimmedValue ? `/?search=${encodeURIComponent(trimmedValue)}` : "/");
      scrollToProducts();
      return;
    }

    const params = new URLSearchParams(location.search);

    if (trimmedValue) {
      params.set("search", trimmedValue);
    } else {
      params.delete("search");
    }

    navigate(
      {
        pathname: "/",
        search: params.toString() ? `?${params.toString()}` : "",
      },
      { replace: true }
    );

    if (trimmedValue) {
      scrollToProducts();
    }
  };


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
        {/* <div className="logoContainer" onClick={() => navigate("/")}>
          <strong className="logoText">ZENVYX</strong>
          <span className="subtext">-- We Create Attitude --</span>
        </div> */}
        <div className="logoContainer" onClick={() => navigate("/")}>
          <img
            src="/Logo_Canva.png"
            alt="ZENVYX"
            className="logoImage"
          />
        </div>

        <div className="searchContainer">
          <input
            type="text"
            placeholder="Search..."
            className="searchInput"
            value={searchText}
            onChange={handleSearchChange}
          />
        </div>

        <div className="actionsDesktop">
          <span
            className={`navMenuItem ${location.pathname === "/wishlist" ? "activeNavMenu" : ""
              }`}
            onClick={() => navigate("/wishlist")}
          >
            My Wishlist
          </span>

          <span
            className={`navMenuItem ${location.pathname === "/cart" ? "activeNavMenu" : ""
              }`}
            onClick={() => navigate("/cart")}
          >
            Cart
          </span>

          <span
            className={`navMenuItem ${location.pathname === "/my-orders" ? "activeNavMenu" : ""
              }`}
            onClick={() => navigate("/my-orders")}
          >
            Orders
          </span>

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
            className="mobileNavIconforlove"
            onClick={() => navigate("/wishlist")}
          >
           <Heart size={22} />
          </div>

          <div
            className="mobileNavIcon"
            onClick={() => navigate("/cart")}
          >
            🛒
          </div>

          {/* <div
            className="mobileNavIcon"
            onClick={() => navigate("/my-orders")}
          >
            📦
          </div> */}

          {!token || !user ? (
            <div
              className="profileIconMobile"
              onClick={() => navigate(route)}
            >
              👤
            </div>
          ) : (
            <div
              className="profileIconMobile"
              onClick={toggleProfilePanel}
            >
              {user?.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.name || "User"}
                  className="mobileUserImage"
                />
              ) : (
                <span className="mobileUserInitial">
                  {firstLetter}
                </span>
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