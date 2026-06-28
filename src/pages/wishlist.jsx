import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getWishlistApi,
  toggleWishlistApi,
  addToCartApi,
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
      await toggleWishlistApi(productId);

   setWishlist(prev =>
    prev.filter(item => item.productId._id !== productId)
);
    } catch (err) {
      console.log(err);
    }
  };

  const moveToCart = async (product) => {
    try {
      await addToCartApi({
        productId: product._id,
        quantity: 1,
        size: product.sizes?.[0],
      });

      alert("Added to cart");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="wishlistPage">

      {/* <div className="wishlistHeader">
        <h2>My Wishlist</h2>
        <span>{wishlist.length} Items</span>
      </div> */}

      {loading ? (
        <div className="wishlistEmpty">
          Loading...
        </div>
      ) : wishlist.length === 0 ? (
        <div className="wishlistEmpty">
          ❤️

          <h3>Your wishlist is empty</h3>

          <p>
            Save your favourite products here.
          </p>

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

   const finalPrice = price - (price * discount) / 100;

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
          onClick={() => navigate(`/product/${product._id}`)}
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
            className="moveCartBtn"
            onClick={() => moveToCart(product)}
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