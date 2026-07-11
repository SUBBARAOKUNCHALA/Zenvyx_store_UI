import React, { useEffect, useMemo, useState } from "react";
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

const Checkout = () => {

  // const navigate = useNavigate();
  const navigate = useNavigate();
  const location = useLocation();

  const buyNowItem = location.state?.mode === "buyNow" ? location.state.item : null;

  const [summary, setSummary] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(true);
  //const [actionLoading, setActionLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
  }, []);

  const calculatedSummary = useMemo(() => {
    const items = summary?.items || [];

    let subtotal = 0;
    let totalDiscount = 0;
    let totalItems = 0;

    items.forEach((item) => {
      console.log("checkout item ", item)
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
    //const delivery = discountedSubtotal >= 999 ? 50 : 99;
    const delivery = discountedSubtotal > 999 ? 0 : 0;
    //const finalTotal = discountedSubtotal + delivery;
    const finalTotal = discountedSubtotal;

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

        description: isUPI
          ? "UPI Payment"
          : "Net Banking Payment",

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
              throw new Error("Payment verification failed");
            }

            const orderPayload = {
              ...payload,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentStatus: "Paid",
            };

            const placedOrder = await placeOrderApi(orderPayload);

            setMessage(
              placedOrder?.data?.message ||
              "Payment successful. Order placed successfully."
            );

            navigate("/my-orders");
          } catch (err) {
            console.error(err);

            setError(
              err?.response?.data?.message ||
              err.message ||
              "Payment completed but order creation failed."
            );
          } finally {
            setActionLoading(false);
            setIsProcessingPayment(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);

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

              {/* <div className="paymentOptions">
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
              </div> */}

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
                !summary?.items?.length
              }
            >
              {
                actionLoading || isProcessingPayment
                  ? "Processing..."
                  : "Place Order"
              }
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