import React, { useEffect, useMemo, useState } from "react";
import "./AdminHome.css";
import { useNavigate } from "react-router-dom";
import { getAdminDashboardApi } from "../../services/authService";

const AdminHome = () => {
  const navigate = useNavigate();

  const adminUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser") || "{}");
    } catch {
      return {};
    }
  }, []);

  const [dashboard, setDashboard] = useState({
    summary: {
      totalOrders: 0,
      totalProducts: 0,
      totalUsers: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      lowStockProducts: 0,
    },
    recentOrders: [],
    lowStockProducts: [],
    topSellingProducts: [],
    latestUsers: [],
    orderStatusCounts: {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    },
    salesOverview: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getAdminDashboardApi();

      if (res?.data?.success) {
        setDashboard(res.data.data);
      } else {
        setError("Failed to load dashboard");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err?.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPaymentBadgeClass = (status) => {
    const value = String(status || "").toLowerCase();
    if (value === "paid") return "successBadge";
    if (value === "pending") return "warningBadge";
    if (value === "failed") return "dangerBadge";
    return "neutralBadge";
  };

  const getOrderBadgeClass = (status) => {
    const value = String(status || "").toLowerCase();
    if (value === "delivered") return "successBadge";
    if (value === "cancelled") return "dangerBadge";
    if (value === "shipped") return "infoBadge";
    if (value === "confirmed") return "primaryBadge";
    if (value === "pending") return "warningBadge";
    return "neutralBadge";
  };

  const statCards = [
    {
      title: "Total Orders",
      value: dashboard.summary.totalOrders,
      icon: "📦",
      helper: "Orders placed in your store",
    },
    {
      title: "Total Products",
      value: dashboard.summary.totalProducts,
      icon: "🛍️",
      helper: "Products currently listed",
    },
    {
      title: "Total Users",
      value: dashboard.summary.totalUsers,
      icon: "👥",
      helper: "Registered customers",
    },
    {
      title: "Revenue",
      value: formatCurrency(dashboard.summary.totalRevenue),
      icon: "💰",
      helper: "Total earnings",
      highlight: true,
    },
    {
      title: "Pending Orders",
      value: dashboard.summary.pendingOrders,
      icon: "⏳",
      helper: "Orders needing action",
    },
    {
      title: "Low Stock",
      value: dashboard.summary.lowStockProducts,
      icon: "⚠️",
      helper: "Products running low",
    },
  ];

  return (
    <div className="adminHomeContent">
      <section className="adminHero">
        <div className="adminHeroLeft">
          <span className="adminWelcomeTag">Admin Panel</span>
          <h1>Welcome back, {adminUser?.name || "Admin"} 👋</h1>
          <p>
            Manage products, users, orders, and sales from one clean dashboard.
          </p>

          <div className="adminHeroActions">
            <button
              className="heroPrimaryBtn"
              onClick={() => navigate("/~fiadmin/add-products")}
            >
              + Add Product
            </button>

            <button className="heroSecondaryBtn" onClick={fetchDashboard}>
              Refresh
            </button>
          </div>
        </div>

        <div className="adminHeroRight">
          <div className="heroMiniCard">
            <span>Total Revenue</span>
            <strong>{formatCurrency(dashboard.summary.totalRevenue)}</strong>
            <p>Current store revenue</p>
          </div>

          <div className="heroMiniCard">
            <span>Pending Orders</span>
            <strong>{dashboard.summary.pendingOrders}</strong>
            <p>Orders waiting for action</p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="adminInfoCard">
          <h2>Loading dashboard...</h2>
          <p>Please wait while we fetch the latest admin data.</p>
        </div>
      ) : error ? (
        <div className="adminInfoCard errorCard">
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <section className="adminSectionHeading">
            <h2>Store Overview</h2>
            <p>Live summary of your e-commerce platform</p>
          </section>

          <section className="adminStatsGrid">
            {statCards.map((item, index) => (
              <div
                key={index}
                className={`adminStatCard ${item.highlight ? "revenueCard" : ""}`}
              >
                <div className="statTop">
                  <span className="statIcon">{item.icon}</span>
                  <h3>{item.title}</h3>
                </div>
                <p>{item.value}</p>
                <small>{item.helper}</small>
              </div>
            ))}
          </section>

          <section className="adminThreeColumnGrid">
            <div className="adminPanelCard">
              <div className="adminPanelHeader">
                <h2>Order Status</h2>
                <span className="panelBadge">Live</span>
              </div>

              <div className="statusGrid">
                <div className="statusBox pendingBox">
                  <span>Pending</span>
                  <strong>{dashboard.orderStatusCounts.pending}</strong>
                </div>
                <div className="statusBox confirmedBox">
                  <span>Confirmed</span>
                  <strong>{dashboard.orderStatusCounts.confirmed}</strong>
                </div>
                <div className="statusBox shippedBox">
                  <span>Shipped</span>
                  <strong>{dashboard.orderStatusCounts.shipped}</strong>
                </div>
                <div className="statusBox deliveredBox">
                  <span>Delivered</span>
                  <strong>{dashboard.orderStatusCounts.delivered}</strong>
                </div>
                <div className="statusBox cancelledBox">
                  <span>Cancelled</span>
                  <strong>{dashboard.orderStatusCounts.cancelled}</strong>
                </div>
              </div>
            </div>

            {/* <div className="adminPanelCard">
              <div className="adminPanelHeader">
                <h2>Latest Users</h2>
                <span className="panelBadge">Recent</span>
              </div>

              {dashboard.latestUsers?.length > 0 ? (
                <div className="simpleList">
                  {dashboard.latestUsers.map((user) => (
                    <div className="simpleListItem" key={user._id}>
                      <div className="avatarBlock">
                        <div className="avatarCircle">
                          {(user.name || user.email || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4>{user.name || "User"}</h4>
                          <p>{user.email}</p>
                        </div>
                      </div>
                      <span>{formatDate(user.createdAt)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="emptyText">No users found.</p>
              )}
            </div> */}

            {/* <div className="adminPanelCard">
              <div className="adminPanelHeader">
                <h2>Quick Actions</h2>
                <span className="panelBadge">Shortcuts</span>
              </div>

              <div className="quickActionsGrid">
                <button onClick={() => navigate("/~fiadmin/add-products")}>
                  Add Product
                </button>
                <button onClick={() => navigate("/~fiadmin/orders")}>
                  Manage Orders
                </button>
                <button onClick={() => navigate("/~fiadmin/customers")}>
                  View Customers
                </button>
                <button onClick={() => navigate("/~fiadmin/settings")}>
                  Settings
                </button>
              </div>
            </div> */}
          </section>

          {/* <section className="adminPanelCard">
            <div className="adminPanelHeader">
              <h2>Recent Orders</h2>
              <span className="panelBadge">{dashboard.recentOrders?.length || 0} Orders</span>
            </div>

            {dashboard.recentOrders?.length > 0 ? (
              <div className="tableWrap">
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>#{String(order._id).slice(-6).toUpperCase()}</td>
                        <td>{order.customerName || "Customer"}</td>
                        <td>{formatCurrency(order.amount)}</td>
                        <td>
                          <span className={`badge ${getPaymentBadgeClass(order.paymentStatus)}`}>
                            {order.paymentStatus || "Pending"}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getOrderBadgeClass(order.orderStatus)}`}>
                            {order.orderStatus || "Pending"}
                          </span>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="emptyText">No recent orders found.</p>
            )}
          </section>

          <section className="adminTwoColumnGrid">
            <div className="adminPanelCard">
              <div className="adminPanelHeader">
                <h2>Low Stock Products</h2>
                <span className="panelBadge">
                  {dashboard.lowStockProducts?.length || 0} Items
                </span>
              </div>

              {dashboard.lowStockProducts?.length > 0 ? (
                <div className="simpleList">
                  {dashboard.lowStockProducts.map((product) => (
                    <div className="simpleListItem productRow" key={product._id}>
                      <div className="productInfo">
                        <img
                          src={product.image || "https://via.placeholder.com/60"}
                          alt={product.name}
                        />
                        <div>
                          <h4>{product.name}</h4>
                          <p>{product.category}</p>
                        </div>
                      </div>
                      <span className="stockText">Stock: {product.stock}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="emptyText">No low stock products.</p>
              )}
            </div>

            <div className="adminPanelCard">
              <div className="adminPanelHeader">
                <h2>Top Selling Products</h2>
                <span className="panelBadge">
                  {dashboard.topSellingProducts?.length || 0} Products
                </span>
              </div>

              {dashboard.topSellingProducts?.length > 0 ? (
                <div className="simpleList">
                  {dashboard.topSellingProducts.map((product) => (
                    <div className="simpleListItem" key={product._id}>
                      <div>
                        <h4>{product.name}</h4>
                        <p>Sold: {product.totalSold || 0}</p>
                      </div>
                      <span>{formatCurrency(product.revenue)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="emptyText">No top selling products found.</p>
              )}
            </div>
          </section>

          <section className="adminPanelCard">
            <div className="adminPanelHeader">
              <h2>Sales Overview</h2>
              <span className="panelBadge">Summary</span>
            </div>

            {dashboard.salesOverview?.length > 0 ? (
              <div className="salesList">
                {dashboard.salesOverview.map((item, index) => (
                  <div className="salesItem" key={index}>
                    <span>{item.date}</span>
                    <strong>{formatCurrency(item.sales)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="emptyText">No sales data available.</p>
            )}
          </section> */}
        </>
      )}
    </div>
  );
};

export default AdminHome;