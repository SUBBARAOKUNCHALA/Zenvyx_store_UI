import React, { useEffect, useState } from "react";
import { cancelMyOrderApi, getMyOrdersApi } from "../services/authService";
import "./MyOrders.css";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [cancelReason, setCancelReason] = useState("");

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
              const isCancelled = order.orderStatus === "Cancelled";
              const canCancel =
                order.orderStatus === "Pending" ||
                order.orderStatus === "Placed" ||
                order.orderStatus === "Confirmed";

              return (
                <div className="orderCard" key={order._id}>
                  <div className="orderTopRow">
                    <div>
                      <h3>Order ID: {order._id}</h3>
                      <p>{new Date(order.createdAt).toLocaleString()}</p>
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

                    {isCancelled && (
                      <span className="cancelledText">
                        This order has been cancelled.
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
    </div>
  );
};

export default MyOrders;