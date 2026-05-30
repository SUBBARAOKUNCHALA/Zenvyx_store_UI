import React from "react";
// import { HashLoader } from "react-spinners";
import { BeatLoader } from "react-spinners";
import "./GlobalLoader.css";

const GlobalLoader = () => {
  return (
    <div className="loader-overlay">
      <div className="loader-content">
        {/* <HashLoader size={70} /> */}
        <BeatLoader size={10} />
        <p>Loading...</p>
      </div>
    </div>
  );
};

export default GlobalLoader;