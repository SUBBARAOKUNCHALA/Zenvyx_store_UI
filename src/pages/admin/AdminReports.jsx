import React, { useEffect, useMemo, useState } from "react";
import {
  Download,
  Filter,
  IndianRupee,
  ReceiptText,
  RefreshCcw,
  Search,
} from "lucide-react";
import {
  getAdminPaymentsApi,
  downloadAdminPaymentsCsvApi,
} from "../../services/authService";
import "./AdminReports.css";

const AdminReports = () => {
  const [payments, setPayments] = useState([]);
  const [totals, setTotals] = useState({
    totalOrders: 0,
    totalAmount: 0,
    totalTds: 0,
    totalNet: 0,
  });

  const [filters, setFilters] = useState({
    from: "",
    to: "",
    method: "ALL",
    status: "ALL",
    search: "",
  });

  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const query = {};
      if (filters.from) query.from = filters.from;
      if (filters.to) query.to = filters.to;
      if (filters.method !== "ALL") query.method = filters.method;
      if (filters.status !== "ALL") query.status = filters.status;

      const res = await getAdminPaymentsApi(query);

      setPayments(res?.data?.data || []);
      setTotals(
        res?.data?.totals || {
          totalOrders: 0,
          totalAmount: 0,
          totalTds: 0,
          totalNet: 0,
        }
      );
    } catch (err) {
      console.error("Fetch payment reports error:", err);
      setError(err?.response?.data?.message || "Failed to load payment reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    const searchValue = filters.search.toLowerCase().trim();

    if (!searchValue) return payments;

    return payments.filter((item) =>
      [
        item.orderId,
        item.customerName,
        item.customerEmail,
        item.customerMobile,
        item.paymentMethod,
        item.paymentStatus,
        item.razorpayPaymentId,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchValue)
    );
  }, [payments, filters.search]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      from: "",
      to: "",
      method: "ALL",
      status: "ALL",
      search: "",
    });

    setTimeout(fetchPayments, 0);
  };

  const downloadCSV = async () => {
    try {
      setDownloadLoading(true);

      const query = {};
      if (filters.from) query.from = filters.from;
      if (filters.to) query.to = filters.to;
      if (filters.method !== "ALL") query.method = filters.method;
      if (filters.status !== "ALL") query.status = filters.status;

      const res = await downloadAdminPaymentsCsvApi(query);

      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `zenvyx-payment-report-${new Date().toISOString().slice(0, 10)}.csv`
      );

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV download error:", err);
      setError("Failed to download CSV report");
    } finally {
      setDownloadLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return `₹${Math.round(Number(amount || 0)).toLocaleString("en-IN")}.00`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="adminReportsPage">
      <div className="reportsHeader">
        <div>
          <span className="reportsBadge">Finance / TDS Reports</span>
          <h1>Payment Download History</h1>
          <p>Track COD, UPI, Net Banking payments and export reports.</p>
        </div>

        <button
          className="downloadReportBtn"
          onClick={downloadCSV}
          disabled={downloadLoading}
        >
          <Download size={18} />
          {downloadLoading ? "Downloading..." : "Download CSV"}
        </button>
      </div>

      {error && <div className="reportsError">{error}</div>}

      <div className="reportStatsGrid">
        <div className="reportStatCard">
          <div className="statIconBox">
            <ReceiptText size={22} />
          </div>
          <div>
            <p>Total Orders</p>
            <h3>{totals.totalOrders || filteredPayments.length}</h3>
          </div>
        </div>

        <div className="reportStatCard">
          <div className="statIconBox">
            <IndianRupee size={22} />
          </div>
          <div>
            <p>Total Amount</p>
            <h3>{formatAmount(totals.totalAmount)}</h3>
          </div>
        </div>

        <div className="reportStatCard">
          <div className="statIconBox">
            <Filter size={22} />
          </div>
          <div>
            <p>TDS Amount</p>
            <h3>{formatAmount(totals.totalTds)}</h3>
          </div>
        </div>

        <div className="reportStatCard">
          <div className="statIconBox">
            <IndianRupee size={22} />
          </div>
          <div>
            <p>Net Amount</p>
            <h3>{formatAmount(totals.totalNet)}</h3>
          </div>
        </div>
      </div>

      <div className="reportsFilterCard">
        <div className="filterInputBox">
          <label>From Date</label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => handleFilterChange("from", e.target.value)}
          />
        </div>

        <div className="filterInputBox">
          <label>To Date</label>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => handleFilterChange("to", e.target.value)}
          />
        </div>

        <div className="filterInputBox">
          <label>Payment Method</label>
          <select
            value={filters.method}
            onChange={(e) => handleFilterChange("method", e.target.value)}
          >
            <option value="ALL">All Methods</option>
            <option value="COD">COD</option>
            <option value="UPI">UPI</option>
            <option value="NET_BANKING">Net Banking</option>
          </select>
        </div>

        <div className="filterInputBox">
          <label>Payment Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        <button className="applyFilterBtn" onClick={fetchPayments}>
          <Filter size={16} />
          Apply
        </button>

        <button className="resetFilterBtn" onClick={resetFilters}>
          <RefreshCcw size={16} />
          Reset
        </button>
      </div>

      <div className="reportsSearchRow">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search order, customer, email, mobile, payment id..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
        />
      </div>

      <div className="reportsTableCard">
        {loading ? (
          <div className="reportsEmpty">Loading payment reports...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="reportsEmpty">No payment history found.</div>
        ) : (
          <div className="reportsTableWrap">
            <table className="reportsTable">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Order Status</th>
                  <th>Amount</th>
                  <th>TDS</th>
                  <th>Net</th>
                  <th>Payment ID</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((item) => (
                  <tr key={item.orderId}>
                    <td>
                      <span className="orderIdText">
                        #{String(item.orderId).slice(-8)}
                      </span>
                    </td>

                    <td>
                      <div className="customerCell">
                        <strong>{item.customerName || "N/A"}</strong>
                        <span>{item.customerEmail || "N/A"}</span>
                        <small>{item.customerMobile || ""}</small>
                      </div>
                    </td>

                    <td>{formatDate(item.date)}</td>

                    <td>
                      <span className="methodPill">{item.paymentMethod}</span>
                    </td>

                    <td>
                      <span
                        className={`statusPill ${
                          item.paymentStatus === "Paid"
                            ? "paid"
                            : item.paymentStatus === "Failed"
                            ? "failed"
                            : "pending"
                        }`}
                      >
                        {item.paymentStatus}
                      </span>
                    </td>

                    <td>{item.orderStatus || "Pending"}</td>
                    <td>{formatAmount(item.finalAmount)}</td>
                    <td>{formatAmount(item.tdsAmount)}</td>
                    <td>{formatAmount(item.netAmount)}</td>

                    <td>
                      <span className="paymentIdText">
                        {item.razorpayPaymentId || "COD / N/A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;