import React, { useEffect, useState } from "react";
import { getMyOrdersApi } from "../services/authService";
import "./MyOrders.css";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        {error && <div className="ordersError">{error}</div>}

        {orders.length === 0 ? (
          <div className="ordersEmpty">
            <h2>No orders found</h2>
            <p>You have not placed any orders yet.</p>
          </div>
        ) : (
          <div className="ordersList">
            {orders.map((order) => (
              <div className="orderCard" key={order._id}>
                <div className="orderTopRow">
                  <div>
                    <h3>Order ID: {order._id}</h3>
                    <p>{new Date(order.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="orderStatusGroup">
                    <span className="orderStatusBadge">{order.orderStatus}</span>
                    <span className="paymentStatusBadge">{order.paymentStatus}</span>
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
                    <p>₹{order.finalAmount}.00</p>
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
                      <strong>₹{item.subtotal}.00</strong>
                    </div>
                  ))}
                </div>

                <div className="orderAddressBox">
                  <strong>Delivery Address</strong>
                  <p>
                    {order.address?.fullName}, {order.address?.mobile}
                  </p>
                  <p>
                    {order.address?.houseNo}, {order.address?.area}, {order.address?.city},{" "}
                    {order.address?.state} - {order.address?.pincode}
                  </p>
                  {order.address?.landmark && <p>Landmark: {order.address.landmark}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;