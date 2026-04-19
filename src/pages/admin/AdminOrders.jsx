import React, { useEffect, useMemo, useState } from "react";
import {
  PackageCheck,
  Truck,
  Search,
  RefreshCcw,
  ShoppingBag,
  IndianRupee,
  User,
  CreditCard,
  CalendarDays,
  ClipboardList,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import "./AdminOrders.css";
import { getAllOrdersApi, updateOrderStatusApi } from "../../services/authService";

const STATUS_OPTIONS = [
  "Confirmed",
  "Packed",
  "Shipped",
  "OutForDelivery",
  "Delivered",
  "Cancelled",
  "Returned",
  "Refunded",
];

const ORDER_STATUS_COLORS = {
  Placed: "status placed",
  Confirmed: "status confirmed",
  Packed: "status packed",
  Shipped: "status shipped",
  OutForDelivery: "status out-for-delivery",
  Delivered: "status delivered",
  Cancelled: "status cancelled",
  Returned: "status returned",
  Refunded: "status refunded",
};

const PAYMENT_STATUS_COLORS = {
  Pending: "payStatus pending",
  Paid: "payStatus paid",
  Failed: "payStatus failed",
  Refunded: "payStatus refunded",
  COD_Pending: "payStatus cod-pending",
  COD_Collected: "payStatus cod-collected",
};

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

const formatDateForInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const [updateForms, setUpdateForms] = useState({});
  const [updateLoadingId, setUpdateLoadingId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const mapFormsFromOrders = (ordersList) => {
    const mappedForms = {};
    ordersList.forEach((order) => {
      mappedForms[order._id] = {
        orderStatus: order.orderStatus || "",
        note: "",
        trackingId: order.trackingId || "",
        shippingProvider: order.shippingProvider || "",
        estimatedDeliveryDate: formatDateForInput(order.estimatedDeliveryDate),
        cancelReason: order.cancelReason || "",
      };
    });
    setUpdateForms(mappedForms);
  };

  const fetchOrders = async (showRefresh = false) => {
    try {
      setPageError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getAllOrdersApi();
      const fetchedOrders = response?.data?.data || [];

      setOrders(fetchedOrders);
      mapFormsFromOrders(fetchedOrders);
    } catch (error) {
      console.error("fetchOrders error:", error);
      setPageError(
        error?.response?.data?.message || "Failed to load admin orders"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 2500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleFormChange = (orderId, field, value) => {
    setUpdateForms((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value,
      },
    }));
  };

  const handleUpdateOrder = async (orderId) => {
    try {
      const form = updateForms[orderId];

      if (!form?.orderStatus) {
        alert("Please select order status");
        return;
      }

      setUpdateLoadingId(orderId);

      const payload = {
        orderStatus: form.orderStatus,
        note: form.note,
        trackingId: form.trackingId,
        shippingProvider: form.shippingProvider,
        estimatedDeliveryDate: form.estimatedDeliveryDate || null,
        cancelReason: form.cancelReason,
      };

      const response = await updateOrderStatusApi(orderId, payload);
      const updatedOrder = response?.data?.data;

      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order))
      );

      setUpdateForms((prev) => ({
        ...prev,
        [orderId]: {
          orderStatus: updatedOrder.orderStatus || "",
          note: "",
          trackingId: updatedOrder.trackingId || "",
          shippingProvider: updatedOrder.shippingProvider || "",
          estimatedDeliveryDate: formatDateForInput(
            updatedOrder.estimatedDeliveryDate
          ),
          cancelReason: updatedOrder.cancelReason || "",
        },
      }));

      setSuccessMessage("Order updated successfully");
    } catch (error) {
      console.error("handleUpdateOrder error:", error);
      alert(error?.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdateLoadingId("");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        order.orderNumber?.toLowerCase().includes(search) ||
        order.userId?.name?.toLowerCase().includes(search) ||
        order.userId?.email?.toLowerCase().includes(search) ||
        order.address?.fullName?.toLowerCase().includes(search) ||
        order.address?.mobile?.toLowerCase().includes(search) ||
        order.items?.some((item) => item.name?.toLowerCase().includes(search));

      const matchesStatus =
        statusFilter === "All" || order.orderStatus === statusFilter;

      const matchesPayment =
        paymentFilter === "All" || order.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  const summary = useMemo(() => {
    return {
      totalOrders: orders.length,
      delivered: orders.filter((o) => o.orderStatus === "Delivered").length,
      pending: orders.filter((o) =>
        ["Placed", "Confirmed", "Packed", "Shipped", "OutForDelivery"].includes(
          o.orderStatus
        )
      ).length,
      revenue: orders
        .filter((o) => o.orderStatus === "Delivered")
        .reduce((sum, order) => sum + Number(order.finalAmount || 0), 0),
    };
  }, [orders]);

  return (
    <div className="adminOrdersPage">
      <div className="adminOrdersTopBar">
        <div>
          <h2>Orders Management</h2>
          <p>Track, filter, and update customer orders from one place.</p>
        </div>

        <div className="adminOrdersActions">
          <button
            className="adminOrdersRefreshBtn"
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
          >
            <RefreshCcw size={16} className={refreshing ? "spinIcon" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="adminOrdersSuccessMsg">{successMessage}</div>
      )}

      <div className="adminOrdersStatsGrid">
        <div className="adminOrderStatCard">
          <div className="statIconWrap purple">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h4>Total Orders</h4>
            <h3>{summary.totalOrders}</h3>
          </div>
        </div>

        <div className="adminOrderStatCard">
          <div className="statIconWrap blue">
            <Truck size={20} />
          </div>
          <div>
            <h4>Active Orders</h4>
            <h3>{summary.pending}</h3>
          </div>
        </div>

        <div className="adminOrderStatCard">
          <div className="statIconWrap green">
            <PackageCheck size={20} />
          </div>
          <div>
            <h4>Delivered</h4>
            <h3>{summary.delivered}</h3>
          </div>
        </div>

        <div className="adminOrderStatCard">
          <div className="statIconWrap orange">
            <IndianRupee size={20} />
          </div>
          <div>
            <h4>Delivered Revenue</h4>
            <h3>{formatCurrency(summary.revenue)}</h3>
          </div>
        </div>
      </div>

      <div className="adminOrdersFilterBar">
        <div className="adminSearchBox">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by order no, name, email, mobile, item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="adminOrdersSelect"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Placed">Placed</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Packed">Packed</option>
          <option value="Shipped">Shipped</option>
          <option value="OutForDelivery">Out For Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Returned">Returned</option>
          <option value="Refunded">Refunded</option>
        </select>

        <select
          className="adminOrdersSelect"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="All">All Payment Status</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
          <option value="COD_Pending">COD Pending</option>
          <option value="COD_Collected">COD Collected</option>
        </select>
      </div>

      {loading ? (
        <div className="adminOrdersLoadingWrap">
          <div className="adminOrdersLoader" />
          <p>Loading orders...</p>
        </div>
      ) : pageError ? (
        <div className="adminOrdersErrorBox">{pageError}</div>
      ) : filteredOrders.length === 0 ? (
        <div className="adminOrdersEmptyState">
          <ClipboardList size={42} />
          <h3>No orders found</h3>
          <p>Try changing search or filter values.</p>
        </div>
      ) : (
        <div className="adminOrdersList">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            const form = updateForms[order._id] || {};

            return (
              <div className="adminOrderCard" key={order._id}>
                <div className="adminOrderCardTop">
                  <div className="adminOrderMetaLeft">
                    <div>
                      <h3>#{order.orderNumber}</h3>
                      <p>Created: {formatDate(order.createdAt)}</p>
                    </div>

                    <div className="adminOrderBadges">
                      <span
                        className={
                          ORDER_STATUS_COLORS[order.orderStatus] || "status"
                        }
                      >
                        {order.orderStatus}
                      </span>

                      <span
                        className={
                          PAYMENT_STATUS_COLORS[order.paymentStatus] ||
                          "payStatus"
                        }
                      >
                        {order.paymentStatus}
                      </span>

                      <span className="methodTag">{order.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="adminOrderMetaRight">
                    <div className="adminOrderAmount">
                      {formatCurrency(order.finalAmount)}
                    </div>

                    <button
                      className="expandOrderBtn"
                      onClick={() =>
                        setExpandedOrderId(isExpanded ? null : order._id)
                      }
                    >
                      {isExpanded ? (
                        <>
                          Hide Details <ChevronUp size={18} />
                        </>
                      ) : (
                        <>
                          View Details <ChevronDown size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="adminOrderQuickGrid">
                  <div className="quickInfoItem">
                    <User size={16} />
                    <div>
                      <span>Customer</span>
                      <strong>
                        {order.userId?.name || order.address?.fullName || "-"}
                      </strong>
                    </div>
                  </div>

                  <div className="quickInfoItem">
                    <CreditCard size={16} />
                    <div>
                      <span>Payment</span>
                      <strong>
                        {order.paymentMethod} / {order.paymentStatus}
                      </strong>
                    </div>
                  </div>

                  <div className="quickInfoItem">
                    <ShoppingBag size={16} />
                    <div>
                      <span>Items</span>
                      <strong>{order.totalItems} item(s)</strong>
                    </div>
                  </div>

                  <div className="quickInfoItem">
                    <CalendarDays size={16} />
                    <div>
                      <span>Estimated Delivery</span>
                      <strong>
                        {order.estimatedDeliveryDate
                          ? formatDate(order.estimatedDeliveryDate)
                          : "-"}
                      </strong>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="adminOrderExpandedArea">
                    <div className="adminOrderDetailsGrid">
                      <div className="adminOrderPanel">
                        <h4>Customer Details</h4>
                        <div className="panelInfoRows">
                          <p>
                            <span>Name:</span>{" "}
                            {order.userId?.name || order.address?.fullName || "-"}
                          </p>
                          <p>
                            <span>Email:</span> {order.userId?.email || "-"}
                          </p>
                          <p>
                            <span>Mobile:</span> {order.address?.mobile || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="adminOrderPanel">
                        <h4>Shipping Address</h4>
                        <div className="panelInfoRows">
                          <p>
                            <span>Full Address:</span>{" "}
                            {[
                              order.address?.houseNo,
                              order.address?.area,
                              order.address?.city,
                              order.address?.state,
                              order.address?.pincode,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          <p>
                            <span>Landmark:</span>{" "}
                            {order.address?.landmark || "-"}
                          </p>
                          <p>
                            <span>Address Type:</span>{" "}
                            {order.address?.addressType || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="adminOrderPanel">
                        <h4>Amount Details</h4>
                        <div className="panelInfoRows">
                          <p>
                            <span>Subtotal:</span>{" "}
                            {formatCurrency(order.subtotalAmount)}
                          </p>
                          <p>
                            <span>Discount:</span>{" "}
                            {formatCurrency(order.discountAmount)}
                          </p>
                          <p>
                            <span>Delivery Charge:</span>{" "}
                            {formatCurrency(order.deliveryCharge)}
                          </p>
                          <p>
                            <span>Final Amount:</span>{" "}
                            {formatCurrency(order.finalAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="adminOrderPanel">
                        <h4>Shipping Info</h4>
                        <div className="panelInfoRows">
                          <p>
                            <span>Tracking ID:</span> {order.trackingId || "-"}
                          </p>
                          <p>
                            <span>Provider:</span>{" "}
                            {order.shippingProvider || "-"}
                          </p>
                          <p>
                            <span>Shipped At:</span>{" "}
                            {order.shippedAt ? formatDate(order.shippedAt) : "-"}
                          </p>
                          <p>
                            <span>Delivered At:</span>{" "}
                            {order.deliveredAt
                              ? formatDate(order.deliveredAt)
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="adminOrderPanel">
                      <h4>Ordered Items</h4>
                      <div className="adminOrderedItemsList">
                        {order.items?.map((item, index) => (
                          <div
                            className="adminOrderedItem"
                            key={`${item.productId}-${index}`}
                          >
                            <div className="adminOrderedItemImage">
                              <img src={item.image} alt={item.name} />
                            </div>

                            <div className="adminOrderedItemContent">
                              <h5>{item.name}</h5>
                              <p>Size: {item.size || "-"}</p>
                              <p>Qty: {item.quantity}</p>
                              <p>Price: {formatCurrency(item.price)}</p>
                              {!!item.discount && (
                                <p>Discount: {item.discount}%</p>
                              )}
                            </div>

                            <div className="adminOrderedItemAmount">
                              {formatCurrency(item.subtotal)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="adminOrderPanel">
                      <h4>Status History</h4>
                      <div className="adminStatusTimeline">
                        {order.statusHistory?.length > 0 ? (
                          order.statusHistory
                            .slice()
                            .reverse()
                            .map((history, idx) => (
                              <div className="timelineItem" key={idx}>
                                <div className="timelineDot" />
                                <div className="timelineContent">
                                  <h5>{history.status}</h5>
                                  <p>{history.note || "-"}</p>
                                  <span>{formatDate(history.changedAt)}</span>
                                </div>
                              </div>
                            ))
                        ) : (
                          <p className="noHistoryText">
                            No status history available
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="adminOrderPanel updatePanel">
                      <h4>Update Order Status</h4>

                      <div className="adminUpdateFormGrid">
                        <div className="adminFormField">
                          <label>Order Status</label>
                          <select
                            value={form.orderStatus || ""}
                            onChange={(e) =>
                              handleFormChange(
                                order._id,
                                "orderStatus",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select status</option>
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="adminFormField">
                          <label>Tracking ID</label>
                          <input
                            type="text"
                            placeholder="Enter tracking id"
                            value={form.trackingId || ""}
                            onChange={(e) =>
                              handleFormChange(
                                order._id,
                                "trackingId",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="adminFormField">
                          <label>Shipping Provider</label>
                          <input
                            type="text"
                            placeholder="BlueDart / Delhivery / DTDC"
                            value={form.shippingProvider || ""}
                            onChange={(e) =>
                              handleFormChange(
                                order._id,
                                "shippingProvider",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="adminFormField">
                          <label>Estimated Delivery Date</label>
                          <input
                            type="date"
                            value={form.estimatedDeliveryDate || ""}
                            onChange={(e) =>
                              handleFormChange(
                                order._id,
                                "estimatedDeliveryDate",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="adminFormField adminFormFieldFull">
                          <label>Admin Note</label>
                          <textarea
                            rows="3"
                            placeholder="Write note about status change"
                            value={form.note || ""}
                            onChange={(e) =>
                              handleFormChange(order._id, "note", e.target.value)
                            }
                          />
                        </div>

                        {form.orderStatus === "Cancelled" && (
                          <div className="adminFormField adminFormFieldFull">
                            <label>Cancel Reason</label>
                            <input
                              type="text"
                              placeholder="Reason for cancellation"
                              value={form.cancelReason || ""}
                              onChange={(e) =>
                                handleFormChange(
                                  order._id,
                                  "cancelReason",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        )}
                      </div>

                      <div className="adminUpdateActionRow">
                        <button
                          className="adminUpdateOrderBtn"
                          onClick={() => handleUpdateOrder(order._id)}
                          disabled={updateLoadingId === order._id}
                        >
                          {updateLoadingId === order._id
                            ? "Updating..."
                            : "Update Order"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;