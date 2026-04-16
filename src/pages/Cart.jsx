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

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyCartApi();
      setCartItems(res?.data?.data || []);
    } catch (err) {
      console.error("Fetch cart error:", err);
      setError(err?.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const cartSummary = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => {
      const price = item?.productId?.price || 0;
      const qty = item?.quantity || 1;
      return acc + price * qty;
    }, 0);

    const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

    const shipping = subtotal > 0 ? 99 : 0;
    const finalTotal = subtotal + shipping;

    return {
      subtotal,
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

      const currentQty = item.quantity || 1;
      const stock = item?.productId?.stock || 0;

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

      const currentQty = item.quantity || 1;

      if (currentQty <= 1) {
        return;
      }

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
              const product = item.productId || {};
              const itemTotal = (product.price || 0) * (item.quantity || 1);

              return (
                <div className="cartCard" key={item._id}>
                  <div className="cartImageBox">
                    <img
                      src={product.image || product.images?.[0]}
                      alt={product.name}
                    />
                  </div>

                  <div className="cartCardContent">
                    <div className="cartTopRow">
                      <div>
                        <h3>{product.name}</h3>
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
                      {product.description || "Premium product selected for your cart."}
                    </p>

                    <div className="cartMetaRow">
                      <span className="cartPrice">₹{product.price}.00</span>
                      <span className="cartStock">
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </span>
                    </div>

                    {product.sizes?.length > 0 && (
                      <div className="cartSizesRow">
                        {product.sizes.map((size) => (
                          <span key={size} className="cartSizeChip">
                            {size}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="cartBottomRow">
                      <div className="cartQtyBox">
                        <button
                          className="qtyControlBtn"
                          onClick={() => handleDecreaseQty(item)}
                          disabled={actionLoading || item.quantity <= 1}
                        >
                          -
                        </button>

                        <span className="qtyNumber">{item.quantity}</span>

                        <button
                          className="qtyControlBtn"
                          onClick={() => handleIncreaseQty(item)}
                          disabled={
                            actionLoading ||
                            (product.stock > 0 ? item.quantity >= product.stock : false)
                          }
                        >
                          +
                        </button>
                      </div>

                      <div className="cartItemTotal">
                        Total: <strong>₹{itemTotal}.00</strong>
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
              <span>₹{cartSummary.subtotal}.00</span>
            </div>

            <div className="summaryRow">
              <span>Shipping</span>
              <span>₹{cartSummary.shipping}.00</span>
            </div>

            <div className="summaryDivider"></div>

            <div className="summaryRow totalSummaryRow">
              <span>Total</span>
              <span>₹{cartSummary.finalTotal}.00</span>
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