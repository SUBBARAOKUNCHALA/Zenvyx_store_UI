import React from "react";
import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");

  if (!token || adminUser?.userType !== "admin") {
    return <Navigate to="/~fiadmin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;