import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import "./App.css";

import Navbar from "./components/Navbar";
import GlobalLoader from "./components/GlobalLoader";
import Terms from "./components/Terms";
import ContactUs from "./components/ContactUs"
import AdminProtectedRoute from "./components/AdminProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Dashboard";
import Cart from "./pages/Cart";
import Wishlist from "./pages/wishlist";
import ProductDetails from "./pages/ProductDetails";
import Address from "./pages/Address";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import HelpCenter from "./pages/HelpCenter.jsx";
import RaiseTicket from "./pages/support/RaiseTicket";
import MyTickets from "./pages/support/MyTickets";
import TicketDetails from "./components/support/TicketDetails.jsx";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AddProducts from "./pages/admin/AddProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import ReturnedOrders from "./pages/admin/ReturnedOrders";
import AdminReports from "./pages/admin/AdminReports";
import DeleteProducts from "./pages/admin/DeleteProducts";

import NotFound from "./utils/NotFound";

function App() {
  const location = useLocation();

  const isAdminRoute = useMemo(() => {
    return location.pathname.startsWith("/~fiadmin");
  }, [location.pathname]);

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

        {/* ================= USER ROUTES ================= */}

        <Route path="/" element={<Home />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/ContactUs" element={<ContactUs />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/help/create" element={<RaiseTicket />} />
        <Route path="/help/my-tickets" element={<MyTickets />} />
        <Route path="/help/ticket/:id" element={<TicketDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/address" element={<Address />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-orders" element={<MyOrders />} />

        {/* ================= ADMIN LOGIN ================= */}

        <Route
          path="/~fiadmin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/~fiadmin"
          element={<Navigate to="/~fiadmin/login" replace />}
        />

        {/* ================= ADMIN ================= */}

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

          <Route
            path="dashboard"
            element={<AdminHome />}
          />

          <Route
            path="add-products"
            element={<AddProducts />}
          />

          <Route
            path="orders"
            element={<AdminOrders />}
          />

          <Route
            path="returns"
            element={<ReturnedOrders />}
          />

          <Route
            path="reports"
            element={<AdminReports />}
          />

          <Route
            path="delete-products"
            element={<DeleteProducts />}
          />

          <Route
            path="customers"
            element={
              <div style={{ padding: 20 }}>
                Customers Page
              </div>
            }
          />

          <Route
            path="settings"
            element={
              <div style={{ padding: 20 }}>
                Settings Page
              </div>
            }
          />
        </Route>

        {/* ================= 404 ================= */}

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </>
  );
}

export default App;