import React, { useEffect, useState } from "react";
import {
  cancelMyOrderApi,
  getMyOrdersApi,
  returnOrderApi,
  downloadInvoiceApi
} from "../services/authService";
import "./MyOrders.css";

const MyOrders = () => {
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReturnOrderId, setSelectedReturnOrderId] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState("");

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const formatDate = (date) => {
    if (!date) return "Not updated";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "Not updated";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "ReturnRequested":
        return "Return Requested";
      case "ReturnAccepted":
        return "Return Accepted";
      case "PickedUp":
        return "Return Picked Up";
      case "Refunded":
        return "Refunded";
      case "Rejected":
        return "Return Rejected";
      case "OutForDelivery":
        return "Out For Delivery";
      default:
        return status || "Not updated";
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await downloadInvoiceApi(orderId);

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${orderId}.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
        "Unable to download invoice."
      );
    }
  };

  const getDisplayStatus = (order) => {
    return order?.returnData?.returnStatus || order?.orderStatus;
  };

  const getDisplayHistory = (order) => {
    if (order?.returnData?.statusHistory?.length > 0) {
      return order.returnData.statusHistory;
    }

    return order?.statusHistory || [];
  };

  const getStatusClass = (status) => {
    return String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/_/g, "");
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getMyOrdersApi();
      setOrders(res?.data?.data || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(err?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? "" : orderId));
  };

  const openReturnModal = (orderId) => {
    setSelectedReturnOrderId(orderId);
    setReturnReason("");
    setShowReturnModal(true);
    setError("");
    setMessage("");
  };

  const closeReturnModal = () => {
    setShowReturnModal(false);
    setSelectedReturnOrderId("");
    setReturnReason("");
  };

  const handleConfirmReturn = async () => {
    try {
      if (!returnReason.trim()) {
        alert("Please enter return reason");
        return;
      }

      setActionLoadingId(selectedReturnOrderId);

      const res = await returnOrderApi(selectedReturnOrderId, {
        reason: returnReason.trim(),
      });

      setMessage(res?.data?.message || "Return requested successfully");
      closeReturnModal();
      fetchOrders();
    } catch (err) {
      console.error("Return error:", err);
      alert(err?.response?.data?.message || "Return failed");
    } finally {
      setActionLoadingId("");
    }
  };


  const isReturnWindowExpired = (order) => {
    if (!order.deliveredAt) return false;

    const deliveredDate = new Date(order.deliveredAt);
    const today = new Date();

    const diffDays = Math.floor(
      (today - deliveredDate) / (1000 * 60 * 60 * 24)
    );

    return diffDays > 7;
  };

  const openCancelModal = (orderId) => {
    setSelectedOrderId(orderId);
    setCancelReason("");
    setShowCancelModal(true);
    setError("");
    setMessage("");
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedOrderId("");
    setCancelReason("");
  };

  const handleConfirmCancel = async () => {
    try {
      if (!cancelReason.trim()) {
        setError("Please enter cancellation reason");
        return;
      }

      setActionLoadingId(selectedOrderId);
      setError("");
      setMessage("");

      const res = await cancelMyOrderApi(selectedOrderId, {
        reason: cancelReason.trim(),
      });

      setMessage(res?.data?.message || "Order cancelled successfully");

      setOrders((prev) =>
        prev.map((order) =>
          order._id === selectedOrderId
            ? {
              ...order,
              orderStatus: "Cancelled",
              cancelReason: cancelReason.trim(),
              cancelledAt: new Date().toISOString(),
            }
            : order
        )
      );

      closeCancelModal();
    } catch (err) {
      console.error("Cancel order error:", err);
      setError(err?.response?.data?.message || "Failed to cancel order");
    } finally {
      setActionLoadingId("");
    }
  };

  if (loading) {
    return (
      <div className="ordersPage">
        <div className="ordersLoading">Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="ordersPage">
      <div className="ordersContainer">
        <div className="ordersHeader">
          <h1>My Orders</h1>
          <p>Track all your recent purchases here.</p>
        </div>

        {message && <div className="ordersSuccess">{message}</div>}
        {error && <div className="ordersError">{error}</div>}

        {orders.length === 0 ? (
          <div className="ordersEmpty">
            <h2>No orders found</h2>
            <p>You have not placed any orders yet.</p>
          </div>
        ) : (
          <div className="ordersList">
            {orders.map((order) => {
              const displayStatus = getDisplayStatus(order);
              const displayHistory = getDisplayHistory(order);
              const firstItem = order.items?.[0];
              const isExpanded = expandedOrderId === order._id;

              const isCancelled = order.orderStatus === "Cancelled";
              const isDelivered = order.orderStatus === "Delivered";
              const hasReturn = Boolean(order.returnData);

              const returnExpired = (() => {
                if (!order.deliveredAt) return false;

                const deliveredDate = new Date(order.deliveredAt);
                const today = new Date();

                const diffDays = Math.floor(
                  (today - deliveredDate) / (1000 * 60 * 60 * 24)
                );

                return diffDays > 7;
              })();

              const canCancel =
                !hasReturn &&
                (order.orderStatus === "Pending" ||
                  order.orderStatus === "Placed" ||
                  order.orderStatus === "Confirmed");

              const canReturn = order.orderStatus === "Delivered" && !hasReturn;

              return (
                <div className="orderCard" key={order._id}>
                  <div className="orderCompactRow">
                    <div className="orderCompactLeft">
                      <img
                        src={firstItem?.image}
                        alt={firstItem?.name || "Product"}
                        className="orderCompactImg"
                      />

                      <div className="orderCompactInfo">
                        <h3>{firstItem?.name || "Product"}</h3>
                        <p>Size: {firstItem?.size || "N/A"}</p>
                        <p>Qty: {firstItem?.quantity || 1}</p>

                        {order.items?.length > 1 && (
                          <small>+{order.items.length - 1} more item(s)</small>
                        )}
                      </div>
                    </div>

                    <div className="orderCompactRight">
                      <span
                        className={`orderStatusBadge ${getStatusClass(
                          displayStatus
                        )}`}
                      >
                        {getStatusLabel(displayStatus)}
                      </span>

                      <div className="compactDateBox">
                        <strong>Estimated Delivery</strong>
                        <p>{formatDate(order.estimatedDeliveryDate)}</p>
                      </div>

                      <button
                        className="viewDetailsBtn"
                        onClick={() => toggleOrderDetails(order._id)}
                      >
                        {isExpanded ? "Hide Details" : "View Details"}
                        <span className={isExpanded ? "arrowUp" : "arrowDown"}>

                        </span>
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="orderExpandedDetails">
                      <div className="orderTopRow">
                        <div>
                          <h3>Order ID: {order.orderNumber || order._id}</h3>
                          <p>{formatDateTime(order.createdAt)}</p>
                        </div>

                        <div className="orderStatusGroup">
                          <span
                            className={`orderStatusBadge ${getStatusClass(
                              displayStatus
                            )}`}
                          >
                            {getStatusLabel(displayStatus)}
                          </span>

                          <span
                            className={`paymentStatusBadge ${getStatusClass(
                              order.paymentStatus
                            )}`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {hasReturn && (
                        <div className="returnInfoBox">
                          <strong>Return Details</strong>
                          <p>
                            Status:{" "}
                            <span>
                              {getStatusLabel(order.returnData.returnStatus)}
                            </span>
                          </p>
                          <p>Reason: {order.returnData.returnReason}</p>
                          <p>Refund Amount: ₹{order.returnData.refundAmount}</p>

                          {order.returnData.pickupDate && (
                            <p>
                              Pickup Date:{" "}
                              {formatDateTime(order.returnData.pickupDate)}
                            </p>
                          )}

                          {/* {order.returnData.pickedUpAt && (
                            <p>
                              Picked Up On:{" "}
                              {formatDateTime(order.returnData.pickedUpAt)}
                            </p>
                          )} */}

                          {order.returnData.refundedAt && (
                            <p>
                              Refunded On:{" "}
                              {formatDateTime(order.returnData.refundedAt)}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="orderMetaGrid">
                        <div>
                          <strong>Total Items</strong>
                          <p>{order.totalItems}</p>
                        </div>

                        <div>
                          <strong>Payment Method</strong>
                          <p>{order.paymentMethod}</p>
                        </div>

                        <div>
                          <strong>Final Amount</strong>
                          <p>₹{Number(order.finalAmount || 0).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="orderTrackingBox">
                        <div>
                          <strong>Estimated Delivery</strong>
                          <p>{formatDate(order.estimatedDeliveryDate)}</p>
                        </div>

                        {order.deliveredAt && (
                          <div>
                            <strong>Delivered On</strong>
                            <p>{formatDate(order.deliveredAt)}</p>
                          </div>
                        )}

                        {order.trackingId && (
                          <div>
                            <strong>Tracking ID</strong>
                            <p>{order.trackingId}</p>
                          </div>
                        )}

                        {order.shippingProvider && (
                          <div>
                            <strong>Shipping Provider</strong>
                            <p>{order.shippingProvider}</p>
                          </div>
                        )}
                      </div>

                      <div className="orderItemsWrap">
                        {order.items?.map((item, index) => (
                          <div className="orderItemRow" key={index}>
                            <img src={item.image} alt={item.name} />

                            <div>
                              <h4>{item.name}</h4>
                              <p>Qty: {item.quantity}</p>
                              {item.size && <p>Size: {item.size}</p>}
                            </div>

                            <strong>
                              ₹{Number(item.subtotal || 0).toFixed(2)}
                            </strong>
                          </div>
                        ))}
                      </div>

                      {displayHistory.length > 0 && (
                        <div className="orderHistoryBox">
                          <strong>
                            {hasReturn
                              ? "Return Tracking History"
                              : "Order Tracking History"}
                          </strong>

                          <div className="horizontalTimeline">
                            {displayHistory.map((history, index) => (
                              <div className="timelineStep" key={index}>
                                <div className="timelineTop">
                                  <div className="timelineCircle completed">
                                    ✓
                                  </div>

                                  {index !== displayHistory.length - 1 && (
                                    <div className="timelineConnector"></div>
                                  )}
                                </div>

                                <div className="timelineDetails">
                                  <h4>{getStatusLabel(history.status)}</h4>
                                  <p>{history.note}</p>
                                  <span>{formatDateTime(history.changedAt)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="orderAddressBox">
                        <strong>Delivery Address</strong>
                        <p>
                          {order.address?.fullName}, {order.address?.mobile}
                        </p>
                        <p>
                          {order.address?.houseNo}, {order.address?.area},{" "}
                          {order.address?.city}, {order.address?.state} -{" "}
                          {order.address?.pincode}
                        </p>
                        {order.address?.landmark && (
                          <p>Landmark: {order.address.landmark}</p>
                        )}
                      </div>

                      <div className="orderBottomRow">
                        {!isCancelled && canCancel && (
                          <button
                            className="cancelOrderBtn"
                            onClick={() => openCancelModal(order._id)}
                            disabled={actionLoadingId === order._id}
                          >
                            {actionLoadingId === order._id
                              ? "Cancelling..."
                              : "Cancel Order"}
                          </button>
                        )}

                        {!isCancelled &&
                          canReturn &&
                          !returnExpired && (
                            <button
                              className="returnOrderBtn"
                              onClick={() => openReturnModal(order._id)}
                              disabled={actionLoadingId === order._id}
                            >
                              {actionLoadingId === order._id
                                ? "Submitting..."
                                : "Return Order"}
                            </button>
                          )}
                        {order.orderStatus === "Delivered" && (
                          <button
                            className="returnOrderBtn"
                            onClick={() => handleDownloadInvoice(order._id)}
                          >
                            Download Invoice
                          </button>
                        )}
                        {isCancelled && (
                          <span className="cancelledText">
                            This order has been cancelled.
                          </span>
                        )}

                        {hasReturn && (
                          <span className="deliveredText">
                            Return status:{" "}
                            {getStatusLabel(order.returnData.returnStatus)}
                          </span>
                        )}

                        {isDelivered && !isCancelled && !hasReturn && (
                          <>
                            {!returnExpired ? (
                              <span className="deliveredText">
                                Delivered successfully. You can request a return within 7 days.
                              </span>
                            ) : (
                              <span className="returnExpiredText">
                                Return window expired (7 days after delivery).
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCancelModal && (
        <div className="cancelModalOverlay">
          <div className="cancelModal">
            <h2>Cancel Order</h2>
            <p>Please tell us why you want to cancel this order.</p>

            <textarea
              className="cancelReasonInput"
              placeholder="Enter cancellation reason..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={5}
            />

            <div className="cancelModalActions">
              <button
                className="cancelModalBtn secondaryBtn"
                onClick={closeCancelModal}
                disabled={actionLoadingId === selectedOrderId}
              >
                Close
              </button>

              <button
                className="cancelModalBtn primaryBtn"
                onClick={handleConfirmCancel}
                disabled={actionLoadingId === selectedOrderId}
              >
                {actionLoadingId === selectedOrderId
                  ? "Submitting..."
                  : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReturnModal && (
        <div className="cancelModalOverlay">
          <div className="cancelModal">
            <h2>Return Order</h2>
            <p>Please tell us why you want to return this order.</p>

            <textarea
              className="cancelReasonInput"
              placeholder="Enter return reason..."
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              rows={5}
            />

            <div className="cancelModalActions">
              <button
                className="cancelModalBtn secondaryBtn"
                onClick={closeReturnModal}
                disabled={actionLoadingId === selectedReturnOrderId}
              >
                Close
              </button>

              <button
                className="cancelModalBtn primaryBtn"
                onClick={handleConfirmReturn}
                disabled={actionLoadingId === selectedReturnOrderId}
              >
                {actionLoadingId === selectedReturnOrderId
                  ? "Submitting..."
                  : "Submit Return"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;