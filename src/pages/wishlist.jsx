import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getWishlistApi,
  toggleWishlistApi,
} from "../services/authService";
import "./Wishlist.css";

const Wishlist = () => {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const res = await getWishlistApi();

      console.log("Wishlist API:", res.data);

      setWishlist(res.data.wishlist || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const removeWishlist = async (productId) => {
    try {
      const res = await toggleWishlistApi(productId);

      if (res.data.success) {
        setWishlist((prev) =>
          prev.filter((item) => item.productId._id !== productId)
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const moveToCart = (item) => {
    navigate(`/product/${item.productId._id}`, {
      state: {
        product: item.productId,
        fromWishlist: true,
      },
    });
  };

  return (
    <div className="wishlistPage">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span className="activeBreadcrumb">Wishlist</span>
      </div>
      {loading ? (
        <div className="wishlistEmpty">
          Loading...
        </div>
      ) : wishlist.length === 0 ? (
        <div className="wishlistEmpty">
          ❤️

          <h3>Your wishlist is empty</h3>

          <p>Save your favourite products here.</p>

          <button onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="wishlistGrid">
          {wishlist.map((item) => {
            const product = item.productId;

            const price = Number(product.price || 0);
            const discount = Number(product.discount || 0);

            const finalPrice =
              discount > 0
                ? price - (price * discount) / 100
                : price;

            return (
              <div
                className="wishlistCard"
                key={item._id}
              >
                <button
                  className="removeWishlist"
                  onClick={() => removeWishlist(product._id)}
                >
                  ✕
                </button>

                <img
                  src={product.image || product.images?.[0]}
                  alt={product.name}
                  onClick={() =>
                    navigate(`/product/${product._id}`, {
                      state: {
                        product,
                      },
                    })
                  }
                />

                <div className="wishlistContent">
                  <h3>{product.name}</h3>

                  <p>{product.description}</p>

                  <div className="wishlistPrice">
                    <span className="newPrice">
                      ₹{Math.round(finalPrice)}
                    </span>

                    {discount > 0 && (
                      <>
                        <span className="oldPrice">
                          ₹{price}
                        </span>

                        <span className="discount">
                          {discount}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    className="buyNowBtn"
                    onClick={() => moveToCart(item)}
                  >
                    Move To Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;