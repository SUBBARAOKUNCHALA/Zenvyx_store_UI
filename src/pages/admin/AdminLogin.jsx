import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLoginApi } from "../../services/authService";
import "./AdminLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await adminLoginApi(form);
      console.log("Admin Response",res)

      const token = res?.data?.token || res?.data?.data?.token;
      const user = res?.data?.admin || res?.data?.data?.admin;

      if (!token || !user) {
        setError("Invalid login response");
        return;
      }

      if (user.userType !== "admin") {
        setError("Access denied. Admin only.");
        return;
      }

      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(user));

      navigate("/~fiadmin/dashboard");
    } catch (err) {
      console.error("Admin login error:", err);
      setError(err?.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adminLoginPage">
      <div className="adminLoginCard">
        <div className="adminLoginTop">
          <span className="adminBadge">Admin Portal</span>
          <h1>Welcome Back</h1>
          <p>Login to manage products, orders, and store controls.</p>
        </div>

        {error && <div className="adminLoginError">{error}</div>}

        <form className="adminLoginForm" onSubmit={handleSubmit}>
          <div className="adminInputGroup">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter admin email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="adminInputGroup">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="adminLoginBtn" disabled={loading}>
            {loading ? "Signing in..." : "Login to Admin Portal"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;