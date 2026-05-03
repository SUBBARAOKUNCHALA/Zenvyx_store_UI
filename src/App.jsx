import { Routes, Route, useLocation, Navigate } from "react-router-dom";

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
import "./App.css";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/~fiadmin");

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/address" element={<Address />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-orders" element={<MyOrders />} />

        {/* admin login */}
        <Route path="/~fiadmin/login" element={<AdminLogin />} />

        {/* redirect base admin url to login */}
        <Route
          path="/~fiadmin"
          element={<Navigate to="/~fiadmin/login" replace />}
        />

        {/* protected admin routes */}
        <Route
          path="/~fiadmin/*"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminHome />} />
          <Route path="add-products" element={<AddProducts />} />
          <Route
            path="orders" element={<AdminOrders/>} />
          <Route
            path="customers"
            element={<div style={{ padding: "20px" }}>Customers Page</div>}
          />
           <Route path="returns" element={<ReturnedOrders />} />
           <Route path="reports" element={<AdminReports />} />
          <Route
            path="settings"
            element={<div style={{ padding: "20px" }}>Settings Page</div>}
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;