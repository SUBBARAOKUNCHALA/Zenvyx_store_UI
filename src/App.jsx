import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import Address from "./pages/Address";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import AdminReports from "./pages/admin/AdminReports";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AddProducts from "./pages/admin/AddProducts";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminOrders from "./pages/admin/AdminOrders";
import ReturnedOrders from "./pages/admin/ReturnedOrders";
import Terms from "./components/Terms";
import GlobalLoader from "./components/GlobalLoader"
import NotFound from "./utils/NotFound";
import "./App.css";
import DeleteProducts from "./pages/admin/DeleteProducts"

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/~fiadmin");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const showLoader = () => setLoading(true);
    const hideLoader = () => setLoading(false);

    document.addEventListener("show-loader", showLoader);
    document.addEventListener("hide-loader", hideLoader);

    return () => {
      document.removeEventListener("show-loader", showLoader);
      document.removeEventListener("hide-loader", hideLoader);
    };
  }, []);

  return (
    <>
      {loading && <GlobalLoader />}

      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/address" element={<Address />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-orders" element={<MyOrders />} />

        {/* Admin Login */}
        <Route path="/~fiadmin/login" element={<AdminLogin />} />

        {/* Redirect Admin Root */}
        <Route
          path="/~fiadmin"
          element={<Navigate to="/~fiadmin/login" replace />}
        />

        {/* Protected Admin Routes */}
        <Route
          path="/~fiadmin/*"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route path="dashboard" element={<AdminHome />} />
          <Route path="add-products" element={<AddProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="returns" element={<ReturnedOrders />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="deleteproduts" element={<DeleteProducts />} />

          <Route
            path="customers"
            element={
              <div style={{ padding: "20px" }}>
                Customers Page
              </div>
            }
          />

          <Route
            path="settings"
            element={
              <div style={{ padding: "20px" }}>
                Settings Page
              </div>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;