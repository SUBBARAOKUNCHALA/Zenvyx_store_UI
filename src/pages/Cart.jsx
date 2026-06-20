import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearMyCartApi,
  getMyCartApi,
  removeCartItemApi,
  updateCartQuantityApi,
} from "../services/authService";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const formatPrice = (value) => `₹${Number(value || 0).toFixed(0)}.00`;

  const getDiscountedPriceDetails = (price, discountPercent, qty = 1) => {
    const originalPrice = Number(price || 0);
    const discount = Number(discountPercent || 0);
    const quantity = Number(qty || 1);

    const discountAmountPerUnit = Math.round((originalPrice * discount) / 100);
    const discountedPricePerUnit = originalPrice - discountAmountPerUnit;

    const originalTotal = originalPrice * quantity;
    const totalDiscount = discountAmountPerUnit * quantity;
    const finalTotal = discountedPricePerUnit * quantity;

    return {
      originalPrice,
      discount,
      quantity,
      discountAmountPerUnit,
      discountedPricePerUnit,
      originalTotal,
      totalDiscount,
      finalTotal,
    };
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getMyCartApi();
      setCartItems(res?.data?.data || []);
    } catch (err) {
      console.error("Fetch cart error:", err);

      const status = err?.response?.status;
      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("Session expired. Please login again");
        navigate("/login");
        return;
      }

      setError(err?.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const cartSummary = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalItems = 0;

    cartItems.forEach((item) => {
      const product = item?.productId || {};
      const qty = Number(item?.quantity || 1);

      const priceDetails = getDiscountedPriceDetails(
        product.price,
        product.discount,
        qty
      );

      subtotal += priceDetails.originalTotal;
      totalDiscount += priceDetails.totalDiscount;
      totalItems += qty;
    });

    const discountedSubtotal = subtotal - totalDiscount;
    const shipping = discountedSubtotal > 999 ? 50 : 99;
    const finalTotal = discountedSubtotal + shipping;

    return {
      subtotal,
      totalDiscount,
      discountedSubtotal,
      totalItems,
      shipping,
      finalTotal,
    };
  }, [cartItems]);

  const handleIncreaseQty = async (item) => {
    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      const currentQty = Number(item?.quantity || 1);
      const stock = Number(item?.productId?.stock || 0);

      if (stock > 0 && currentQty >= stock) {
        setError("Maximum stock reached");
        return;
      }

      await updateCartQuantityApi(item._id, {
        quantity: currentQty + 1,
      });

      setCartItems((prev) =>
        prev.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: currentQty + 1 }
            : cartItem
        )
      );
    } catch (err) {
      console.error("Increase quantity error:", err);
      setError(err?.response?.data?.message || "Failed to update quantity");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecreaseQty = async (item) => {
    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      const currentQty = Number(item?.quantity || 1);

      if (currentQty <= 1) return;

      await updateCartQuantityApi(item._id, {
        quantity: currentQty - 1,
      });

      setCartItems((prev) =>
        prev.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: currentQty - 1 }
            : cartItem
        )
      );
    } catch (err) {
      console.error("Decrease quantity error:", err);
      setError(err?.response?.data?.message || "Failed to update quantity");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      const res = await removeCartItemApi(cartItemId);

      setCartItems((prev) => prev.filter((item) => item._id !== cartItemId));
      setMessage(res?.data?.message || "Item removed from cart");
    } catch (err) {
      console.error("Remove item error:", err);
      setError(err?.response?.data?.message || "Failed to remove item");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearCart = async () => {
    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      const res = await clearMyCartApi();
      setCartItems([]);
      setMessage(res?.data?.message || "Cart cleared successfully");
    } catch (err) {
      console.error("Clear cart error:", err);
      setError(err?.response?.data?.message || "Failed to clear cart");
    } finally {
      setActionLoading(false);
    }
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="cartPage">
        <div className="cartLoadingState">Loading your cart...</div>
      </div>
    );
  }

  return (
    <div className="cartPage">
      <div className="cartHeader">
        <div>
          <h1>My Cart</h1>
          <p>{cartSummary.totalItems} items in your shopping bag</p>
        </div>

        {cartItems.length > 0 && (
          <button
            className="clearCartBtn"
            onClick={handleClearCart}
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : "Clear Cart"}
          </button>
        )}
      </div>

      {message && <div className="cartAlertSuccess">{message}</div>}
      {error && <div className="cartAlertError">{error}</div>}

      {cartItems.length === 0 ? (
        <div className="emptyCartBox">
          <h2>Your cart is empty</h2>
          <p>Looks like you have not added anything yet.</p>
          <button className="shopNowBtn" onClick={handleContinueShopping}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cartLayout">
          <div className="cartItemsSection">
            {cartItems.map((item) => {
              const product = item?.productId || {};
              const qty = Number(item?.quantity || 1);

              const {
                originalPrice,
                discount,
                discountedPricePerUnit,
                finalTotal,
              } = getDiscountedPriceDetails(
                product.price,
                product.discount,
                qty
              );

              return (
                <div className="cartCard" key={item._id}>
                  {/* <div className="cartImageBox">
                    <img
                      src={product.image || product.images?.[0]}
                      alt={product.name}
                    />
                  </div> */}

                  <div
  className="cartImageBox clickableProduct"
  onClick={() =>
    navigate(`/product/${product._id}`, {
      state: { product },
    })
  }
>
  <img
    src={product.image || product.images?.[0]}
    alt={product.name}
  />
</div>

                  <div className="cartCardContent">
                    <div className="cartTopRow">
                      <div>
                        {/* <h3>{product.name}</h3> */}

                        <h3
  className="cartProductLink"
  onClick={() =>
    navigate(`/product/${product._id}`, {
      state: { product },
    })
  }
>
  {product.name}
</h3>
                        <p className="cartCategory">{product.category}</p>
                      </div>

                      <button
                        className="removeItemBtn"
                        onClick={() => handleRemoveItem(item._id)}
                        disabled={actionLoading}
                      >
                        Remove
                      </button>
                    </div>

                    <p className="cartDescription">
                      {product.description ||
                        "Premium product selected for your cart."}
                    </p>

                    <div className="cartMetaRow">
                      <span className="cartPrice">
                        {discount > 0 ? (
                          <>
                            <span
                              style={{
                                textDecoration: "line-through",
                                marginRight: "8px",
                                opacity: 0.6,
                              }}
                            >
                              {formatPrice(originalPrice)}
                            </span>
                            <strong>{formatPrice(discountedPricePerUnit)}</strong>
                          </>
                        ) : (
                          <>{formatPrice(originalPrice)}</>
                        )}
                      </span>

                      <span className="cartStock">
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="cartDiscountRow">
                        <span>{discount}% OFF</span>
                      </div>
                    )}

                    {/* {item.size && (
                      <div className="cartSizesRow">
                        <span className="cartSizeChip selectedSizeChip">
                          Size: {item.size}
                        </span>
                      </div>
                    )} */}

                    {item.size && (
  <div className="cartSizesRow">
    <span className="cartSizeChip selectedSizeChip">
      Size: {item.size}
    </span>

    <button
      className="changeSizeBtn"
      onClick={() =>
        navigate(`/product/${product._id}`, {
          state: { product },
        })
      }
    >
      Change Size
    </button>
  </div>
)}

                    <div className="cartBottomRow">
                      <div className="cartQtyBox">
                        <button
                          className="qtyControlBtn"
                          onClick={() => handleDecreaseQty(item)}
                          disabled={actionLoading || qty <= 1}
                        >
                          -
                        </button>

                        <span className="qtyNumber">{qty}</span>

                        <button
                          className="qtyControlBtn"
                          onClick={() => handleIncreaseQty(item)}
                          disabled={
                            actionLoading ||
                            (product.stock > 0 ? qty >= product.stock : false)
                          }
                        >
                          +
                        </button>
                      </div>

                      <div className="cartItemTotal">
                        Total: <strong>{formatPrice(finalTotal)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="cartSummaryCard">
            <h2>Order Summary</h2>

            <div className="summaryRow">
              <span>Items ({cartSummary.totalItems})</span>
              <span>{formatPrice(cartSummary.subtotal)}</span>
            </div>

            <div className="summaryRow">
              <span>Discount</span>
              <span>- {formatPrice(cartSummary.totalDiscount)}</span>
            </div>

            <div className="summaryRow">
              <span>Shipping</span>
              <span>{formatPrice(cartSummary.shipping)}</span>
            </div>

            <div className="summaryDivider"></div>

            <div className="summaryRow totalSummaryRow">
              <span>Total</span>
              <span>{formatPrice(cartSummary.finalTotal)}</span>
            </div>

            <button className="checkoutBtn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>

            <button className="continueBtn" onClick={handleContinueShopping}>
              Continue Shopping
            </button>

            <div className="summaryInfoBox">
              <span>7 Days Easy Return</span>
              <span>Secure Payments</span>
              <span>Fast Delivery</span>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;