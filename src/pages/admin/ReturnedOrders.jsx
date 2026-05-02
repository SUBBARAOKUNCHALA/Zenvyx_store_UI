import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshCcw,
  Search,
  PackageCheck,
  Loader2,
  AlertCircle,
  Eye,
  X,
  CheckCircle,
} from "lucide-react";
import {
  getReturnedOrdersApi,
  updateReturnedOrderStatusApi,
} from "../../services/authService";
import "./ReturnedOrders.css";

const RETURN_STATUS_OPTIONS = [
  { label: "All Status", value: "All" },
  { label: "Return Requested", value: "ReturnRequested" },
  { label: "Return Accepted", value: "ReturnAccepted" },
  { label: "Picked Up", value: "PickedUp" },
  { label: "Refunded", value: "Refunded" },
  { label: "Rejected", value: "Rejected" },
];

const initialFormData = {
  pickupDate: "",
  pickupPartner: "",
  pickupTrackingId: "",
  refundMode: "",
  refundTransactionId: "",
  adminNote: "",
};

const ReturnedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const fetchReturnedOrders = async () => {
    try {
      setLoading(true);
      const res = await getReturnedOrdersApi();
      const data = res?.data?.data || [];
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("fetchReturnedOrders error:", error);
      alert(error?.response?.data?.message || "Failed to fetch returned orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnedOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];

    if (search.trim()) {
      const q = search.toLowerCase();

      result = result.filter((order) => {
        const userName = order?.userId?.name || "";
        const userEmail = order?.userId?.email || "";
        const returnId = order?._id || "";
        const orderDbId = order?.orderId?._id || "";
        const orderNumber =
          order?.orderNumber || order?.orderId?.orderNumber || "";
        const phone =
          order?.customerAddress?.mobile ||
          order?.customerAddress?.phone ||
          order?.orderId?.address?.mobile ||
          "";
        const customerName =
          order?.customerAddress?.fullName ||
          order?.orderId?.address?.fullName ||
          "";

        return (
          userName.toLowerCase().includes(q) ||
          userEmail.toLowerCase().includes(q) ||
          returnId.toLowerCase().includes(q) ||
          orderDbId.toLowerCase().includes(q) ||
          orderNumber.toLowerCase().includes(q) ||
          phone.toLowerCase().includes(q) ||
          customerName.toLowerCase().includes(q)
        );
      });
    }

    if (statusFilter !== "All") {
      result = result.filter((order) => order.returnStatus === statusFilter);
    }

    setFilteredOrders(result);
  }, [search, statusFilter, orders]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      requested: orders.filter((o) => o.returnStatus === "ReturnRequested")
        .length,
      accepted: orders.filter((o) => o.returnStatus === "ReturnAccepted")
        .length,
      pickedUp: orders.filter((o) => o.returnStatus === "PickedUp").length,
      refunded: orders.filter((o) => o.returnStatus === "Refunded").length,
      rejected: orders.filter((o) => o.returnStatus === "Rejected").length,
    };
  }, [orders]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getReturnStatusLabel = (status) => {
    switch (status) {
      case "ReturnRequested":
        return "Return Requested";
      case "ReturnAccepted":
        return "Return Accepted";
      case "PickedUp":
        return "Picked Up";
      case "Refunded":
        return "Refunded";
      case "Rejected":
        return "Rejected";
      default:
        return status || "Return Requested";
    }
  };

  const getReturnBadgeClass = (status) => {
    switch (status) {
      case "ReturnRequested":
        return "returnBadge requested";
      case "ReturnAccepted":
        return "returnBadge approved";
      case "PickedUp":
        return "returnBadge pickedup";
      case "Rejected":
        return "returnBadge rejected";
      case "Refunded":
        return "returnBadge refunded";
      default:
        return "returnBadge";
    }
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setFormData(initialFormData);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setFormData(initialFormData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateReturnStatus = async (returnId, returnStatus) => {
    try {
      const payload = {
        returnStatus,
      };

      if (formData.adminNote.trim()) {
        payload.adminNote = formData.adminNote.trim();
      }

      if (returnStatus === "PickedUp") {
        if (!formData.pickupDate) {
          alert("Please select pickup date");
          return;
        }

        if (!formData.pickupPartner.trim()) {
          alert("Please enter pickup partner");
          return;
        }

        if (!formData.pickupTrackingId.trim()) {
          alert("Please enter pickup tracking id");
          return;
        }

        payload.pickupDate = formData.pickupDate;
        payload.pickupPartner = formData.pickupPartner.trim();
        payload.pickupTrackingId = formData.pickupTrackingId.trim();
      }

      if (returnStatus === "Refunded") {
        if (!formData.refundMode.trim()) {
          alert("Please enter refund mode");
          return;
        }

        if (!formData.refundTransactionId.trim()) {
          alert("Please enter refund transaction id");
          return;
        }

        payload.refundMode = formData.refundMode.trim();
        payload.refundTransactionId = formData.refundTransactionId.trim();
      }

      setUpdatingId(returnId);

      await updateReturnedOrderStatusApi(returnId, payload);

      alert(`Return status updated to ${getReturnStatusLabel(returnStatus)}`);
      closeModal();
      fetchReturnedOrders();
    } catch (error) {
      console.error("updateReturnStatus error:", error);
      alert(error?.response?.data?.message || "Failed to update return status");
    } finally {
      setUpdatingId("");
    }
  };

  const canAccept = selectedOrder?.returnStatus === "ReturnRequested";
  const canPickup = selectedOrder?.returnStatus === "ReturnAccepted";
  const canRefund = selectedOrder?.returnStatus === "PickedUp";
  const canReject =
    selectedOrder?.returnStatus === "ReturnRequested" ||
    selectedOrder?.returnStatus === "ReturnAccepted";

  return (
    <div className="returnedOrdersPage">
      <div className="returnedHeader">
        <div>
          <h2>Returned Orders</h2>
          <p>Manage return requests, pickup details and refunds</p>
        </div>

        <button className="refreshBtn" onClick={fetchReturnedOrders}>
          <RefreshCcw size={17} />
          Refresh
        </button>
      </div>

      <div className="returnStatsGrid">
        <div className="returnStatCard">
          <span>Total Returns</span>
          <h3>{stats.total}</h3>
        </div>

        <div className="returnStatCard">
          <span>Requested</span>
          <h3>{stats.requested}</h3>
        </div>

        <div className="returnStatCard">
          <span>Accepted</span>
          <h3>{stats.accepted}</h3>
        </div>

        <div className="returnStatCard">
          <span>Picked Up</span>
          <h3>{stats.pickedUp}</h3>
        </div>

        <div className="returnStatCard">
          <span>Refunded</span>
          <h3>{stats.refunded}</h3>
        </div>
      </div>

      <div className="returnControls">
        <div className="returnSearchBox">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by customer, email, phone, return id, order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {RETURN_STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="returnLoading">
          <Loader2 className="spinIcon" size={28} />
          <p>Loading returned orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="returnEmpty">
          <AlertCircle size={36} />
          <h3>No returned orders found</h3>
          <p>Return requests will appear here.</p>
        </div>
      ) : (
        <div className="returnedTableWrapper">
          <table className="returnedTable">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Refund Amount</th>
                <th>Return Reason</th>
                <th>Status</th>
                <th>Requested Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <strong>
                      {order?.orderNumber ||
                        order?.orderId?.orderNumber ||
                        `#${order._id?.slice(-8)}`}
                    </strong>
                    <small className="returnIdText">
                      Return ID: #{order._id?.slice(-8)}
                    </small>
                  </td>

                  <td>
                    <div className="customerCell">
                      <strong>
                        {order?.userId?.name ||
                          order?.customerAddress?.fullName ||
                          order?.orderId?.address?.fullName ||
                          "Customer"}
                      </strong>
                      <span>{order?.userId?.email || "No email"}</span>
                      <small>
                        {order?.customerAddress?.mobile ||
                          order?.orderId?.address?.mobile ||
                          "No phone"}
                      </small>
                    </div>
                  </td>

                  <td>
                    <div className="itemsCell">
                      {order?.items?.slice(0, 2).map((item, index) => (
                        <span key={index}>
                          {item?.name || item?.productName || "Product"} ×{" "}
                          {item?.quantity}
                        </span>
                      ))}

                      {order?.items?.length > 2 && (
                        <small>+{order.items.length - 2} more</small>
                      )}
                    </div>
                  </td>

                  <td>
                    <strong>₹{order?.refundAmount || 0}</strong>
                  </td>

                  <td>
                    <p className="reasonText">
                      {order?.returnReason ||
                        order?.returnDetails?.reason ||
                        "N/A"}
                    </p>
                  </td>

                  <td>
                    <span className={getReturnBadgeClass(order.returnStatus)}>
                      {getReturnStatusLabel(order.returnStatus)}
                    </span>
                  </td>

                  <td>{formatDate(order?.createdAt)}</td>

                  <td>
                    <button
                      className="viewReturnBtn"
                      onClick={() => openModal(order)}
                    >
                      <Eye size={16} />
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="returnModalOverlay">
          <div className="returnModal">
            <button className="closeReturnModal" onClick={closeModal}>
              <X size={20} />
            </button>

            <div className="returnModalHeader">
              <PackageCheck size={30} />
              <div>
                <h3>Manage Return</h3>
                <p>
                  {selectedOrder?.orderNumber ||
                    selectedOrder?.orderId?.orderNumber ||
                    `#${selectedOrder._id?.slice(-8)}`}
                </p>
              </div>
            </div>

            <div className="returnModalBody">
              <div className="returnInfoGrid">
                <div>
                  <span>Customer</span>
                  <strong>
                    {selectedOrder?.userId?.name ||
                      selectedOrder?.customerAddress?.fullName ||
                      "Customer"}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{selectedOrder?.userId?.email || "N/A"}</strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>
                    {selectedOrder?.customerAddress?.mobile || "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Refund Amount</span>
                  <strong>₹{selectedOrder?.refundAmount || 0}</strong>
                </div>

                <div>
                  <span>Current Return Status</span>
                  <strong>
                    {getReturnStatusLabel(selectedOrder?.returnStatus)}
                  </strong>
                </div>

                <div>
                  <span>Requested Date</span>
                  <strong>{formatDate(selectedOrder?.createdAt)}</strong>
                </div>
              </div>

              <div className="returnReasonBox">
                <span>Customer Return Reason</span>
                <p>{selectedOrder?.returnReason || "No reason provided"}</p>
              </div>

              <div className="returnProductsList">
                <h4>Returned Products</h4>

                {selectedOrder?.items?.map((item, index) => (
                  <div className="returnProductItem" key={index}>
                    <img
                      src={item?.image || item?.productId?.image}
                      alt={item?.name || "Product"}
                    />

                    <div>
                      <strong>{item?.name || item?.productName}</strong>
                      <span>Qty: {item?.quantity}</span>
                      <span>Size: {item?.size || "N/A"}</span>
                    </div>

                    <h5>₹{item?.price || 0}</h5>
                  </div>
                ))}
              </div>

              {canPickup && (
                <div className="returnActionForm">
                  <h4>Pickup Details Required</h4>

                  <div className="formGrid">
                    <div className="formGroup">
                      <label>Pickup Date *</label>
                      <input
                        type="date"
                        name="pickupDate"
                        value={formData.pickupDate}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="formGroup">
                      <label>Pickup Partner *</label>
                      <input
                        type="text"
                        name="pickupPartner"
                        placeholder="Delhivery / BlueDart / DTDC"
                        value={formData.pickupPartner}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="formGroup fullWidth">
                      <label>Pickup Tracking ID *</label>
                      <input
                        type="text"
                        name="pickupTrackingId"
                        placeholder="Example: DLV123456"
                        value={formData.pickupTrackingId}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="apiPreviewBox">
                    <strong>Request Body Preview</strong>
                    <pre>
{JSON.stringify(
  {
    returnStatus: "PickedUp",
    pickupDate: formData.pickupDate || "YYYY-MM-DD",
    pickupPartner: formData.pickupPartner || "Delhivery",
    pickupTrackingId: formData.pickupTrackingId || "DLV123456",
  },
  null,
  2
)}
                    </pre>
                  </div>
                </div>
              )}

              {canRefund && (
                <div className="returnActionForm">
                  <h4>Refund Details Required</h4>

                  <div className="formGrid">
                    <div className="formGroup">
                      <label>Refund Mode *</label>
                      <input
                        type="text"
                        name="refundMode"
                        placeholder="Manual / UPI / Bank Transfer / Razorpay"
                        value={formData.refundMode}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="formGroup">
                      <label>Refund Transaction ID *</label>
                      <input
                        type="text"
                        name="refundTransactionId"
                        placeholder="Enter refund transaction id"
                        value={formData.refundTransactionId}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {(canAccept || canReject || canPickup || canRefund) && (
                <div className="formGroup adminNoteFull">
                  <label>Admin Note</label>
                  <textarea
                    name="adminNote"
                    placeholder="Enter admin note..."
                    value={formData.adminNote}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <div className="returnModalActions">
              {canReject && (
                <button
                  className="rejectReturnBtn"
                  disabled={updatingId === selectedOrder._id}
                  onClick={() =>
                    updateReturnStatus(selectedOrder._id, "Rejected")
                  }
                >
                  Reject
                </button>
              )}

              {canAccept && (
                <button
                  className="approveReturnBtn"
                  disabled={updatingId === selectedOrder._id}
                  onClick={() =>
                    updateReturnStatus(selectedOrder._id, "ReturnAccepted")
                  }
                >
                  {updatingId === selectedOrder._id ? (
                    <Loader2 className="spinIcon" size={17} />
                  ) : (
                    <CheckCircle size={17} />
                  )}
                  Accept Return
                </button>
              )}

              {canPickup && (
                <button
                  className="pickupReturnBtn"
                  disabled={updatingId === selectedOrder._id}
                  onClick={() =>
                    updateReturnStatus(selectedOrder._id, "PickedUp")
                  }
                >
                  {updatingId === selectedOrder._id
                    ? "Updating..."
                    : "Submit Pickup & Mark Picked Up"}
                </button>
              )}

              {canRefund && (
                <button
                  className="refundReturnBtn"
                  disabled={updatingId === selectedOrder._id}
                  onClick={() =>
                    updateReturnStatus(selectedOrder._id, "Refunded")
                  }
                >
                  {updatingId === selectedOrder._id
                    ? "Updating..."
                    : "Submit Refund & Mark Refunded"}
                </button>
              )}

              {!canReject && !canAccept && !canPickup && !canRefund && (
                <button className="approveReturnBtn" disabled>
                  No Action Available
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnedOrders;