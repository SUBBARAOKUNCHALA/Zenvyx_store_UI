import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getCheckoutSummaryApi,
  getMyAddressesApi,
  placeOrderApi,
  setDefaultAddressApi,
  createRazorpayOrderApi,
  verifyRazorpayPaymentApi,
} from "../services/authService";
import "./Checkout.css";

const PENDING_PAYMENT_KEY = "zenvyx_pending_payment";

// small helper: retry an async fn a few times with backoff
const retryAsync = async (fn, attempts = 3, delayMs = 1500) => {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
      }
    }
  }
  throw lastErr;
};

const savePendingPayment = (data) => {
  try {
    localStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to persist pending payment", e);
  }
};

const clearPendingPayment = () => {
  localStorage.removeItem(PENDING_PAYMENT_KEY);
};

const loadPendingPayment = () => {
  try {
    const raw = localStorage.getItem(PENDING_PAYMENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const buyNowItem = location.state?.mode === "buyNow" ? location.state.item : null;

  const [summary, setSummary] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // shown when payment succeeded but order creation is stuck / needs manual retry
  const [recoveryPayment, setRecoveryPayment] = useState(null);
  const [recoveryRetrying, setRecoveryRetrying] = useState(false);

  const razorpayInstanceRef = useRef(null);

  const fetchCheckoutData = async () => {
    try {
      setLoading(true);
      setError("");

      const addressRes = await getMyAddressesApi();
      const addressData = addressRes?.data?.data || [];

      setAddresses(addressData);

      if (buyNowItem) {
        setSummary({
          items: [buyNowItem],
          address: null,
        });
      } else {
        const summaryRes = await getCheckoutSummaryApi();
        const summaryData = summaryRes?.data?.data || null;

        setSummary(summaryData);

        if (summaryData?.address?._id) {
          setSelectedAddressId(summaryData.address._id);
        }
      }

      const defaultAddress = addressData.find((item) => item.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
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

    // Recovery check: did we leave this page mid-payment last time?
    const pending = loadPendingPayment();
    if (pending) {
      setRecoveryPayment(pending);
    }
  }, []);

const calculatedSummary = useMemo(() => {
  const items = summary?.items || [];

  let subtotal = 0;
  let totalDiscount = 0;
  let totalItems = 0;

  items.forEach((item) => {
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
  const delivery = discountedSubtotal >= 999 ? 10 : 5; // match backend logic exactly
  const finalTotal = discountedSubtotal + delivery;     // ✅ now includes delivery

  return {
    subtotal,
    totalDiscount,
    discountedSubtotal,
    totalItems,
    delivery,
    finalTotal,
  };
}, [summary]);

  // Attempts to finalize an order for a payment that already succeeded on Razorpay's side.
  // Used both right after the handler fires, and for manual "recovery" retries.
  const finalizeOrder = async (orderPayload) => {
    const placedOrder = await retryAsync(
      () => placeOrderApi(orderPayload),
      3, // 3 attempts
      1500
    );

    // success — we can forget about this pending payment now
    clearPendingPayment();
    setRecoveryPayment(null);

    setMessage(
      placedOrder?.data?.message ||
      "Payment successful. Order placed successfully."
    );

    navigate("/my-orders");
  };

  const handleRecoveryRetry = async () => {
    if (!recoveryPayment) return;

    setRecoveryRetrying(true);
    setError("");

    try {
      await finalizeOrder(recoveryPayment);
    } catch (err) {
      console.error("Recovery retry failed:", err);
      setError(
        "We still couldn't confirm your order automatically. Your payment is safe — " +
        "please contact support with the Payment ID below so we can create the order manually."
      );
    } finally {
      setRecoveryRetrying(false);
    }
  };

  const handleDismissRecovery = () => {
    // Only lets the user hide the banner if they've already contacted support
    // or are certain — doesn't delete localStorage silently on its own.
    clearPendingPayment();
    setRecoveryPayment(null);
  };

  const handlePlaceOrder = async () => {
    if (actionLoading || isProcessingPayment) return;

    setActionLoading(true);
    setIsProcessingPayment(true);
    setMessage("");
    setError("");

    const isUPI = paymentMethod === "UPI";
    const isNetBanking = paymentMethod === "NET_BANKING";

    try {
      if (!selectedAddressId) {
        setError("Please select a delivery address");
        return;
      }

      const selectedAddress = addresses.find(
        (a) => a._id === selectedAddressId
      );

      const payload = {
        addressId: selectedAddressId,
        paymentMethod,
      };

      if (buyNowItem) {
        payload.mode = "buyNow";
        payload.item = buyNowItem;
      }

      // ================= COD =================

      if (paymentMethod === "COD") {
        const res = await placeOrderApi(payload);

        setMessage(res?.data?.message || "Order placed successfully");

        setTimeout(() => {
          navigate("/my-orders");
        }, 800);

        return;
      }

      // ================= ONLINE =================

      if (!isUPI && !isNetBanking) {
        setError("Please select UPI or Net Banking");
        return;
      }

      const paymentAmount = Math.round(
        Number(calculatedSummary.finalTotal || 0)
      );

      if (paymentAmount <= 0) {
        setError("Invalid payment amount");
        return;
      }

      // Create Razorpay Order
      const orderRes = await createRazorpayOrderApi({
        amount: paymentAmount,
      });

      const razorpayOrder = orderRes?.data?.data;

      if (!razorpayOrder?.id) {
        setError("Unable to create Razorpay order");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "ZENVYX",
        description: isUPI ? "UPI Payment" : "Net Banking Payment",
        order_id: razorpayOrder.id,

        method: {
          upi: isUPI,
          netbanking: isNetBanking,
          card: false,
          wallet: false,
          paylater: false,
          emi: false,
        },

        prefill: {
          name: selectedAddress?.fullName || "",
          contact: selectedAddress?.mobile || "",
        },

        notes: {
          addressId: selectedAddressId,
          paymentMethod,
        },

        theme: {
          color: "#111827",
        },

        handler: async (response) => {
          try {
            const verifyRes = await verifyRazorpayPaymentApi({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (!verifyRes?.data?.success) {
              // Verification failed client-side, but Razorpay already reported
              // success in its own popup. Persist details so nothing is lost —
              // the webhook will also confirm this payment server-side independently.
              savePendingPayment({
                ...payload,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentStatus: "Paid",
              });
              setRecoveryPayment(loadPendingPayment());
              throw new Error(
                "Payment verification failed on our end, but your payment may have gone through."
              );
            }

            const orderPayload = {
              ...payload,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentStatus: "Paid",
            };

            // Persist BEFORE attempting placeOrder — if this tab dies mid-request,
            // the next visit to /checkout will pick this up automatically.
            savePendingPayment(orderPayload);

            await finalizeOrder(orderPayload);
          } catch (err) {
            console.error(err);

            setError(
              err?.response?.data?.message ||
              err.message ||
              "Payment completed but order creation failed. We'll retry automatically — " +
              "please don't close this page."
            );
          } finally {
            setActionLoading(false);
            setIsProcessingPayment(false);
          }
        },

        modal: {
          // Fires when the user closes the Razorpay popup without paying.
          // Without this, actionLoading/isProcessingPayment stay stuck true forever.
          ondismiss: () => {
            setActionLoading(false);
            setIsProcessingPayment(false);
            setError("Payment window closed before completion.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      razorpayInstanceRef.current = rzp;

      rzp.on("payment.failed", function (response) {
        console.error(response);

        setError(
          response.error?.description || "Payment failed."
        );

        setActionLoading(false);
        setIsProcessingPayment(false);
      });

      rzp.open();
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
        err.message ||
        "Failed to place order."
      );

      setActionLoading(false);
      setIsProcessingPayment(false);
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

            {/* Recovery banner — payment succeeded earlier but order wasn't confirmed */}
            {recoveryPayment && (
              <div
                className="checkoutError"
                style={{
                  border: "1px solid #f0b429",
                  background: "#fff8e6",
                  padding: "14px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <p style={{ fontWeight: 600, marginBottom: 6 }}>
                  We found an unfinished payment
                </p>
                <p style={{ marginBottom: 6 }}>
                  A previous payment (Payment ID:{" "}
                  <code>{recoveryPayment.razorpayPaymentId}</code>) may have succeeded
                  but the order wasn't confirmed. Click below to try finishing it —
                  you will not be charged again.
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={handleRecoveryRetry} disabled={recoveryRetrying}>
                    {recoveryRetrying ? "Retrying..." : "Retry Order Creation"}
                  </button>
                  <button onClick={handleDismissRecovery} disabled={recoveryRetrying}>
                    I've contacted support / Dismiss
                  </button>
                </div>
              </div>
            )}

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
                <label className={`paymentCard ${paymentMethod === "COD" ? "active" : ""}`}>
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

                <label className={`paymentCard ${paymentMethod === "UPI" ? "active" : ""}`}>
                  <input
                    type="radio"
                    checked={paymentMethod === "UPI"}
                    onChange={() => setPaymentMethod("UPI")}
                  />
                  <div>
                    <h4>UPI Payment</h4>
                    <p>Pay securely using PhonePe, GPay, Paytm or any UPI app.</p>
                  </div>
                </label>

                <label className={`paymentCard ${paymentMethod === "NET_BANKING" ? "active" : ""}`}>
                  <input
                    type="radio"
                    checked={paymentMethod === "NET_BANKING"}
                    onChange={() => setPaymentMethod("NET_BANKING")}
                  />
                  <div>
                    <h4>Net Banking</h4>
                    <p>Pay directly through your bank account.</p>
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
              disabled={
                actionLoading ||
                isProcessingPayment ||
                !!recoveryPayment ||
                !summary?.items?.length
              }
            >
              {actionLoading || isProcessingPayment
                ? "Processing..."
                : recoveryPayment
                ? "Resolve pending payment above first"
                : "Place Order"}
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