import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCheckoutSummaryApi,
  getMyAddressesApi,
  placeOrderApi,
  setDefaultAddressApi,
} from "../services/authService";
import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchCheckoutData = async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryRes, addressRes] = await Promise.all([
        getCheckoutSummaryApi(),
        getMyAddressesApi(),
      ]);

      const summaryData = summaryRes?.data?.data || null;
      const addressData = addressRes?.data?.data || [];

      setSummary(summaryData);
      setAddresses(addressData);

      if (summaryData?.address?._id) {
        setSelectedAddressId(summaryData.address._id);
      } else {
        const defaultAddress = addressData.find((item) => item.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
        }
      }
    } catch (err) {
      console.error("Checkout fetch error:", err);
      setError(err?.response?.data?.message || "Failed to load checkout");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const calculatedSummary = useMemo(() => {
    const items = summary?.items || [];

    let subtotal = 0;
    let totalDiscount = 0;
    let totalItems = 0;

    items.forEach((item) => {
        console.log("checkout item ",item)
      const price = Number(item?.price || 0);
      const qty = Number(item?.quantity || 1);
      const discountPercent = Number(item?.discount || 0);

      const itemSubtotal = price * qty;
      const discountAmount = ((price * discountPercent) / 100) * qty;

      subtotal += itemSubtotal;
      totalDiscount += discountAmount;
      totalItems += qty;
    });

    const discountedSubtotal = subtotal - totalDiscount;
    const delivery = discountedSubtotal > 999 ? 50 : 99;
    const finalTotal = discountedSubtotal + delivery;

    return {
      subtotal,
      totalDiscount,
      discountedSubtotal,
      totalItems,
      delivery,
      finalTotal,
    };
  }, [summary]);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError("Please select a delivery address");
      return;
    }

    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      const res = await placeOrderApi({
        addressId: selectedAddressId,
        paymentMethod,
      });

      setMessage(res?.data?.message || "Order placed successfully");

      setTimeout(() => {
        navigate("/my-orders");
      }, 800);
    } catch (err) {
      console.error("Place order error:", err);
      setError(err?.response?.data?.message || "Failed to place order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectAddress = async (id) => {
    setSelectedAddressId(id);

    try {
      await setDefaultAddressApi(id);
      setAddresses((prev) =>
        prev.map((address) => ({
          ...address,
          isDefault: address._id === id,
        }))
      );
    } catch (err) {
      console.error("Set default from checkout error:", err);
    }
  };

  const handleGoToAddressPage = () => {
    navigate("/address");
  };

  if (loading) {
    return (
      <div className="checkoutPage">
        <div className="checkoutLoading">Loading checkout...</div>
      </div>
    );
  }

  return (
    <div className="checkoutPage">
      <div className="checkoutContainer">
        <div className="checkoutLeft">
          <div className="checkoutCard">
            <div className="checkoutCardHeader">
              <div>
                <h1>Checkout</h1>
                <p>Review your order and confirm delivery details</p>
              </div>
              <button className="manageAddressBtn" onClick={handleGoToAddressPage}>
                Manage Addresses
              </button>
            </div>

            {message && <div className="checkoutSuccess">{message}</div>}
            {error && <div className="checkoutError">{error}</div>}

            <div className="checkoutSection">
              <h2>Select Delivery Address</h2>

              {addresses.length === 0 ? (
                <div className="emptyAddressBox">
                  <p>No address found. Please add one to continue.</p>
                  <button onClick={handleGoToAddressPage}>Add Address</button>
                </div>
              ) : (
                <div className="checkoutAddressList">
                  {addresses.map((address) => (
                    <label className="checkoutAddressCard" key={address._id}>
                      <div className="checkoutAddressTop">
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressId === address._id}
                          onChange={() => handleSelectAddress(address._id)}
                        />
                        <div>
                          <h3>
                            {address.fullName}
                            {address.isDefault && (
                              <span className="checkoutDefaultBadge">Default</span>
                            )}
                          </h3>
                          <p>{address.mobile}</p>
                        </div>
                      </div>

                      <p>
                        {address.houseNo}, {address.area}, {address.city},{" "}
                        {address.state} - {address.pincode}
                      </p>

                      {address.landmark && <p>Landmark: {address.landmark}</p>}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="checkoutSection">
              <h2>Payment Method</h2>

              <div className="paymentOptions">
                <label className="paymentCard">
                  <input
                    type="radio"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                  />
                  <div>
                    <h4>Cash on Delivery</h4>
                    <p>Pay after product delivery.</p>
                  </div>
                </label>

                <label className="paymentCard">
                  <input
                    type="radio"
                    checked={paymentMethod === "RAZORPAY"}
                    onChange={() => setPaymentMethod("RAZORPAY")}
                  />
                  <div>
                    <h4>Razorpay</h4>
                    <p>Online payment integration ready.</p>
                  </div>
                </label>

                <label className="paymentCard">
                  <input
                    type="radio"
                    checked={paymentMethod === "UPI"}
                    onChange={() => setPaymentMethod("UPI")}
                  />
                  <div>
                    <h4>UPI</h4>
                    <p>Collect via UPI payment flow later.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="checkoutSection">
              <h2>Order Items</h2>

              {!summary?.items?.length ? (
                <div className="emptyCheckoutItems">No items found in checkout.</div>
              ) : (
                <div className="checkoutItemsList">
                  {summary.items.map((item, index) => {
                    const price = Number(item?.price || 0);
                    const qty = Number(item?.quantity || 1);
                    const discountPercent = Number(item?.discount || 0);
                    const discountAmount = (price * discountPercent) / 100;
                    const finalPrice = price - discountAmount;
                    const itemTotal = finalPrice * qty;

                    return (
                      <div className="checkoutItemCard" key={item.productId || index}>
                        <div className="checkoutItemImage">
                          <img src={item.image} alt={item.name} />
                        </div>

                        <div className="checkoutItemContent">
                          <h3>{item.name}</h3>
                          <p>Quantity: {item.quantity}</p>
                          {item.size && <p>Size: {item.size}</p>}

                          <div className="checkoutItemPriceRow">
                            <span>
                              {discountPercent > 0 ? (
                                <>
                                  <span
                                    style={{
                                      textDecoration: "line-through",
                                      marginRight: "8px",
                                      opacity: 0.6,
                                    }}
                                  >
                                    ₹{price.toFixed(2)}
                                  </span>
                                  <strong>₹{Math.round(finalPrice.toFixed(2))}.00</strong>
                                  
                                </>
                              ) : (
                                <>₹{price.toFixed(2)}</>
                              )}
                            </span>

                            <strong>₹{Math.round(itemTotal.toFixed(2))}.00</strong>
                           
                          </div>

                          {discountPercent > 0 && (
                            <div
                              className="checkoutDiscountTag"
                              style={{
                                marginTop: "8px",
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "#1e8e3e",
                              }}
                            >
                              {discountPercent}% OFF
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="checkoutRight">
          <div className="checkoutSummaryCard">
            <h2>Order Summary</h2>

            <div className="checkoutSummaryRow">
              <span>Items ({calculatedSummary.totalItems})</span>
              <span>₹{calculatedSummary.subtotal.toFixed(2)}</span>
            </div>

            <div className="checkoutSummaryRow">
              <span>Delivery</span>
              <span>₹{calculatedSummary.delivery.toFixed(2)}</span>
            </div>

            <div className="checkoutSummaryRow">
              <span>Discount</span>
              <span>- ₹{calculatedSummary.totalDiscount.toFixed(2)}</span>
            </div>

            <div className="checkoutDivider"></div>

            <div className="checkoutSummaryRow totalRow">
              <span>Total</span>
              <span>₹{Math.round(calculatedSummary.finalTotal)}.00</span>
            </div>

            <button
              className="placeOrderBtn"
              onClick={handlePlaceOrder}
              disabled={actionLoading || !summary?.items?.length}
            >
              {actionLoading ? "Placing Order..." : "Place Order"}
            </button>

            <button className="backToCartBtn" onClick={() => navigate("/cart")}>
              Back to Cart
            </button>

            <div className="checkoutInfoBox">
              <span>Secure checkout</span>
              <span>Delivery tracking</span>
              <span>Easy return support</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;