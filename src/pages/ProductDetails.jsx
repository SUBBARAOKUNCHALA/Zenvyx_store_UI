import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  addToCartApi,
  getProductById,
  getSimilarProducts,
} from "../services/authService";
import "./ProductDetails.css";

const ALPHABET_SIZES = ["S", "M", "L", "XL", "XXL"];
const INCH_SIZES = ["28", "30", "32", "34", "36", "38"];

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [product, setProduct] = useState(location.state?.product || null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showInches, setShowInches] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");

  const [selectedImage, setSelectedImage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [cartLoading, setCartLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");
  const [quantity, setQuantity] = useState(1);

  const sizeStockMap = useMemo(() => {
    const map = {};

    product?.sizes?.forEach((item) => {
      const size = String(item?.size || "").toUpperCase();
      map[size] = Number(item?.stock || 0);
    });

    return map;
  }, [product]);

  const visibleSizes = showInches ? INCH_SIZES : ALPHABET_SIZES;

  const selectedSizeStock = selectedSize
    ? sizeStockMap[String(selectedSize).toUpperCase()] || 0
    : 0;

  const isSizeAvailable = (size) => {
    return (sizeStockMap[String(size).toUpperCase()] || 0) > 0;
  };

  const getFirstAvailableSize = (sizesList) => {
    return sizesList.find((size) => isSizeAvailable(size)) || "";
  };

  const productImages = useMemo(() => {
    if (product?.images?.length > 0) return product.images;
    if (product?.image) return [product.image];
    return [];
  }, [product]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);

        const [productRes, similarRes] = await Promise.all([
          getProductById(id),
          getSimilarProducts(id),
        ]);

        const singleProduct = productRes?.data?.data || null;
        const similar = similarRes?.data?.data || [];

        setProduct(singleProduct);
        setSimilarProducts(similar);

        const tempMap = {};
        singleProduct?.sizes?.forEach((item) => {
          const size = String(item?.size || "").toUpperCase();
          tempMap[size] = Number(item?.stock || 0);
        });

        const firstAlphabetSize =
          ALPHABET_SIZES.find((size) => tempMap[size] > 0) || "";

        const firstInchSize =
          INCH_SIZES.find((size) => tempMap[size] > 0) || "";

        if (firstAlphabetSize) {
          setShowInches(false);
          setSelectedSize(firstAlphabetSize);
        } else if (firstInchSize) {
          setShowInches(true);
          setSelectedSize(firstInchSize);
        } else {
          setShowInches(false);
          setSelectedSize("");
        }

        if (singleProduct?.images?.length > 0) {
          setSelectedImage(singleProduct.images[0]);
          setCurrentImageIndex(0);
        } else if (singleProduct?.image) {
          setSelectedImage(singleProduct.image);
          setCurrentImageIndex(0);
        } else {
          setSelectedImage("");
          setCurrentImageIndex(0);
        }

        setQuantity(1);
        setCartMessage("");
        setCartError("");
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleSizeTypeChange = (checked) => {
    setShowInches(checked);
    setCartError("");
    setCartMessage("");
    setQuantity(1);

    const nextSizes = checked ? INCH_SIZES : ALPHABET_SIZES;
    setSelectedSize(getFirstAvailableSize(nextSizes));
  };

  const handleSizeSelect = (size) => {
    if (!isSizeAvailable(size)) return;

    setSelectedSize(size);
    setQuantity(1);
    setCartError("");
    setCartMessage("");
  };

  const handleSimilarClick = (item) => {
    navigate(`/product/${item._id}`, {
      state: { product: item },
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleThumbnailSelect = (img, index) => {
    setSelectedImage(img);
    setCurrentImageIndex(index);
  };

  const handlePrevImage = () => {
    if (productImages.length === 0) return;

    const newIndex =
      currentImageIndex === 0 ? productImages.length - 1 : currentImageIndex - 1;

    setCurrentImageIndex(newIndex);
    setSelectedImage(productImages[newIndex]);
  };

  const handleNextImage = () => {
    if (productImages.length === 0) return;

    const newIndex =
      currentImageIndex === productImages.length - 1 ? 0 : currentImageIndex + 1;

    setCurrentImageIndex(newIndex);
    setSelectedImage(productImages[newIndex]);
  };

  const handleDecreaseQty = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncreaseQty = () => {
    if (!selectedSize) return;

    if (quantity < selectedSizeStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const validateBeforeAction = () => {
    if (!localStorage.getItem("token")) {
      setCartError("Please login first");
      navigate("/login")
      return false;
    }

    if (!product?._id) {
      setCartError("Product not found");
      return false;
    }

    if (product?.stock <= 0) {
      setCartError("This product is out of stock");
      return false;
    }

    if (!selectedSize) {
      setCartError("Please select a size");
      return false;
    }

    if (selectedSizeStock <= 0) {
      setCartError("Selected size is out of stock");
      return false;
    }

    if (quantity > selectedSizeStock) {
      setCartError(`Only ${selectedSizeStock} items available for this size`);
      return false;
    }

    return true;
  };

  const handleAddToCart = async () => {
    try {
      setCartLoading(true);
      setCartMessage("");
      setCartError("");

      if (!validateBeforeAction()) return;

      const payload = {
        productId: product._id,
        quantity,
        size: selectedSize,
      };

      const res = await addToCartApi(payload);

      setCartMessage(res?.data?.message || "Item added to cart successfully");
    } catch (error) {
      console.error("Add to cart error:", error);
      setCartError(
        error?.response?.data?.message || "Failed to add item to cart"
      );
    } finally {
      setCartLoading(false);
    }
  };

  const handleBuyNow = () => {
    setCartMessage("");
    setCartError("");

    if (!validateBeforeAction()) return;

    navigate("/checkout", {
      state: {
        mode: "buyNow",
        item: {
          productId: product._id,
          name: product.name,
          price: product.price,
          discount: product.discount || 0,
          quantity,
          size: selectedSize,
          image: product.image || product.images?.[0],
          category: product.category,
          stock: selectedSizeStock,
        },
      },
    });
  };

  const finalPrice =
    product?.discount > 0
      ? Math.round(product.price - (product.price * product.discount) / 100)
      : product?.price;

  if (loading) {
    return <div style={{ padding: "100px 20px" }}>Loading product details...</div>;
  }

  if (!product) {
    return <div style={{ padding: "100px 20px" }}>Product not found</div>;
  }

  return (
    <div className="productDetailsPage">
      <div className="productDetailsContainer">
        <div className="productDetailsLeft">
          <div className="productDetailsImage">
            <img src={selectedImage || product.image} alt={product.name} />

            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="imageNavBtn prevImageBtn"
                  onClick={handlePrevImage}
                >
                  ‹
                </button>

                <button
                  type="button"
                  className="imageNavBtn nextImageBtn"
                  onClick={handleNextImage}
                >
                  ›
                </button>
              </>
            )}
          </div>

          <div className="thumbnailRow">
            {productImages.map((img, index) => (
              <div
                key={index}
                className={`thumbBox ${selectedImage === img ? "activeThumb" : ""
                  }`}
                onClick={() => handleThumbnailSelect(img, index)}
                onMouseEnter={() => handleThumbnailSelect(img, index)}
              >
                <img src={img} alt={`product-${index}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="productDetailsContent">
          <h1 className="productTitle">{product.name}</h1>

          <p className="productCategory">
            {product.category}
            {product.subCategory ? ` / ${product.subCategory}` : ""}
          </p>

          <div className="productPriceWrap">
            {product.discount > 0 ? (
              <>
                <p className="finalPrice">₹{finalPrice}.00</p>
                <p className="originalPrice">₹{product.price}.00</p>
                <span className="productDiscountBadge">
                  {product.discount}% OFF
                </span>
              </>
            ) : (
              <p className="finalPrice">₹{product.price}.00</p>
            )}
          </div>

          <p className="productDesc">{product.description}</p>

          <div className="sizeSection">
            <div className="sizeHeader">
              <h3 className="sizeTitle">Available Sizes</h3>

              {/* <label className="inchCheckBox">
                <input
                  type="checkbox"
                  checked={showInches}
                  onChange={(e) => handleSizeTypeChange(e.target.checked)}
                />
                <span>In Inches</span>
              </label> */}
            </div>

            <div className="sizeOptions">
               <label className="inchCheckBox">
                <input
                  type="checkbox"
                  checked={showInches}
                  onChange={(e) => handleSizeTypeChange(e.target.checked)}
                />
                <span>In Inches</span>
              </label>
              {visibleSizes.map((size) => {
                const stock = sizeStockMap[String(size).toUpperCase()] || 0;
                const available = stock > 0;

                return (

                  <button
                    key={size}
                    type="button"
                    disabled={!available}
                    className={`sizeBtn ${String(selectedSize) === String(size) ? "active" : ""
                      } ${!available ? "disabledSize" : ""}`}
                    onClick={() => handleSizeSelect(size)}
                    title={available ? `${stock} available` : "This size is not available"}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="quantitySection">

            <h3 className="quantityTitle">
              Quantity{" "}
              {selectedSize && (
                <span className="selectedStockText">
                  {selectedSizeStock} available for {selectedSize}
                </span>
              )}
            </h3>

            <div className="quantitySelector">
              <button
                type="button"
                className="qtyBtn"
                onClick={handleDecreaseQty}
                disabled={quantity <= 1}
              >
                -
              </button>

              <span className="qtyValue">{quantity}</span>

              <button
                type="button"
                className="qtyBtn"
                onClick={handleIncreaseQty}
                disabled={!selectedSize || quantity >= selectedSizeStock}
              >
                +
              </button>
            </div>
          </div>

          {cartMessage && <div className="cartSuccessMessage">{cartMessage}</div>}
          {cartError && <div className="cartErrorMessage">{cartError}</div>}

          <div className="productActions">
            <button
              className="addCartBtn"
              onClick={handleAddToCart}
              disabled={cartLoading || product.stock <= 0 || !selectedSize}
            >
              {cartLoading ? "Adding..." : "Add to Cart"}
            </button>

            <button
              className="buyNowBtn"
              onClick={handleBuyNow}
              disabled={cartLoading || product.stock <= 0 || !selectedSize}
            >
              Buy Now
            </button>
          </div>

          <div className="productInfoBox">
            <h4>Product Information</h4>

            <div className="infoGrid">
              <div className="infoItem">
                <strong>Category</strong>
                {product.category}
              </div>

              <div className="infoItem">
                <strong>Total Stock</strong>
                {product.stock > 0
                  ? `${product.stock} available`
                  : "Out of stock"}
              </div>

              <div className="infoItem">
                <strong>Selected Size</strong>
                {selectedSize || "Not selected"}
              </div>

              <div className="infoItem">
                <strong>Selected Size Stock</strong>
                {selectedSize ? selectedSizeStock : "Select size"}
              </div>

              <div className="infoItem">
                <strong>Discount</strong>
                {product.discount > 0 ? `${product.discount}%` : "No discount"}
              </div>

              <div className="infoItem productDetailsItem">
                <strong>Product Details</strong>
                <p>{product.ProductDetails || "No extra details available"}</p>
              </div>
            </div>
          </div>

          {similarProducts.length > 0 && (
            <div className="similarSection">
              <h3>People also viewed</h3>

              <div className="similarGrid">
                {similarProducts.map((item) => {
                  const similarFinalPrice =
                    item.discount > 0
                      ? Math.round(
                        item.price - (item.price * item.discount) / 100
                      )
                      : item.price;

                  return (
                    <div
                      key={item._id}
                      className="similarProductCard"
                      onClick={() => handleSimilarClick(item)}
                    >
                      <div className="similarProductImage">
                        <img
                          src={item.image || item.images?.[0]}
                          alt={item.name}
                        />
                      </div>

                      <div className="similarProductContent">
                        <h4>{item.name}</h4>

                        <p className="similarProductCategory">
                          {item.category}
                        </p>

                        <div className="similarPriceRow">
                          <span className="similarPrice">
                            ₹{similarFinalPrice}.00
                          </span>

                          {item.discount > 0 && (
                            <span className="similarDiscount">
                              {item.discount}% OFF
                            </span>
                          )}
                        </div>

                        <p className="similarStock">
                          {item.stock > 0
                            ? `${item.stock} left`
                            : "Out of stock"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;