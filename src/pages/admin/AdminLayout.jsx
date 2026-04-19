import React, { useMemo, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PackagePlus,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import "./AdminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser")) || {};
    } catch {
      return {};
    }
  }, []);

  const navItems = [
    {
      label: "Dashboard",
      path: "/~fiadmin/dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: "Add Products",
      path: "/~fiadmin/add-products",
      icon: <PackagePlus size={18} />,
    },
    {
      label: "Orders",
      path: "/~fiadmin/orders",
      icon: <ShoppingBag size={18} />,
    },
    // {
    //   label: "Customers",
    //   path: "/~fiadmin/customers",
    //   icon: <Users size={18} />,
    // },
    // {
    //   label: "Settings",
    //   path: "/~fiadmin/settings",
    //   icon: <Settings size={18} />,
    // },
  ];

  const currentPageTitle = useMemo(() => {
    const found = navItems.find((item) => item.path === location.pathname);
    return found?.label || "Admin Panel";
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/~fiadmin/login");
  };

  const handleNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="adminLayoutShell">
      {sidebarOpen && (
        <div
          className="adminSidebarOverlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`adminSidebar ${sidebarOpen ? "showSidebar" : ""}`}>
        <div className="adminSidebarInner">
          <div>
            <div className="adminSidebarBrand">
              <div className="adminBrandLogo">FI</div>
              <div>
                <h2>FI Admin</h2>
                <p>Store Control Panel</p>
              </div>
            </div>

            <div className="adminProfileCard">
              <div className="adminProfileAvatar">
                {(adminUser?.name || adminUser?.email || "A")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <h4>{adminUser?.name || "Admin User"}</h4>
                <p>{adminUser?.email || "admin@store.com"}</p>
              </div>
            </div>

            <nav className="adminSidebarNav">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  className={`adminNavItem ${
                    location.pathname === item.path ? "active" : ""
                  }`}
                  onClick={() => handleNavigate(item.path)}
                >
                  <span className="adminNavIcon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <button className="adminLogoutBtn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="adminMain">
        <header className="adminTopHeader">
          <div className="adminTopHeaderLeft">
            <button
              className="adminMenuToggle"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <h1>{currentPageTitle}</h1>
              <p>Manage your store operations in one place</p>
            </div>
          </div>

          <div className="adminTopHeaderRight">
            <div className="adminHeaderBadge">Admin Panel</div>
          </div>
        </header>

        <section className="adminContentWrapper">
          <Outlet />
        </section>
      </main>

      {sidebarOpen && (
        <button
          className="adminCloseSidebarBtn"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={22} />
        </button>
      )}
    </div>
  );
};

export default AdminLayout;