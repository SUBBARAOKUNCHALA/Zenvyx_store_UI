import React, { useEffect, useState } from "react";
import { cancelMyOrderApi, getMyOrdersApi,returnOrderApi } from "../services/authService";
import "./MyOrders.css";

const MyOrders = () => {
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReturnOrderId, setSelectedReturnOrderId] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  //const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  const openReturnModal = (orderId) => {
    setSelectedReturnOrderId(orderId);
    setReturnReason("");
    setShowReturnModal(true);
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

    await returnOrderApi(selectedReturnOrderId, {
      reason: returnReason,
    });

    // update UI
    setOrders((prev) =>
      prev.map((o) =>
        o._id === selectedReturnOrderId
          ? { ...o, orderStatus: "Returned" }
          : o
      )
    );

    closeReturnModal();
  } catch (err) {
    console.error("Return error:", err);
    alert(err?.response?.data?.message || "Return failed");
  } finally {
    setActionLoadingId("");
  }
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

  const handleReturnOrder = (orderId) => {
    alert(`Return order API not created yet. Order ID: ${orderId}`);
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
              const isCancelled = order.orderStatus === "Cancelled";
              const isDelivered = order.orderStatus === "Delivered";

              const canCancel =
                order.orderStatus === "Pending" ||
                order.orderStatus === "Placed" ||
                order.orderStatus === "Confirmed";

              const canReturn = order.orderStatus === "Delivered";

              return (
                <div className="orderCard" key={order._id}>
                  <div className="orderTopRow">
                    <div>
                      <h3>Order ID: {order.orderNumber || order._id}</h3>
                      <p>{formatDateTime(order.createdAt)}</p>
                    </div>

                    <div className="orderStatusGroup">
                      <span
                        className={`orderStatusBadge ${order.orderStatus
                          ?.toLowerCase()
                          ?.replace(/\s+/g, "")}`}
                      >
                        {order.orderStatus}
                      </span>

                      <span
                        className={`paymentStatusBadge ${order.paymentStatus
                          ?.toLowerCase()
                          ?.replace(/\s+/g, "")}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

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
                    {/* <div>
                      <strong>Shipping Provider</strong>
                      <p>{order.shippingProvider || "Not assigned yet"}</p>
                    </div>

                    <div>
                      <strong>Tracking ID</strong>
                      <p>{order.trackingId || "Not available"}</p>
                    </div> */}

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

                        <strong>₹{Number(item.subtotal || 0).toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>

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

                    {!isCancelled && canReturn && (
                      <button
                        className="returnOrderBtn"
                        onClick={() => openReturnModal(order._id)}
                      >
                        Return Order
                      </button>
                    )}

                    {isCancelled && (
                      <span className="cancelledText">
                        This order has been cancelled.
                      </span>
                    )}

                    {isDelivered && !isCancelled && (
                      <span className="deliveredText">
                        Delivered successfully. You can request return.
                      </span>
                    )}
                  </div>
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