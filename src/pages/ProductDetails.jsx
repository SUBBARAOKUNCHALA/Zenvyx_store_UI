import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getProductById, getSimilarProducts } from "../services/authService";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [product, setProduct] = useState(location.state?.product || null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const productImages = useMemo(() => {
    if (product?.images?.length > 0) {
      return product.images;
    }
    if (product?.image) {
      return [product.image];
    }
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

        if (singleProduct?.sizes?.length > 0) {
          setSelectedSize(singleProduct.sizes[0]);
        } else {
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
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

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
                className={`thumbBox ${
                  selectedImage === img ? "activeThumb" : ""
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

          <p className="productCategory">{product.category}</p>

          <div className="productPriceWrap">
            <p className="productPrice">₹{product.price}.00</p>

            {product.discount > 0 && (
              <span className="productDiscountBadge">{product.discount}% OFF</span>
            )}
          </div>

          <p className="productDesc">{product.description}</p>

          <div className="sizeSection">
            <h3 className="sizeTitle">Available Sizes</h3>
            <div className="sizeOptions">
              {product.sizes?.length > 0 ? (
                product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`sizeBtn ${selectedSize === size ? "active" : ""}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))
              ) : (
                <span>No sizes available</span>
              )}
            </div>
          </div>

          <div className="productActions">
            <button className="addCartBtn">Add to Cart</button>
            <button className="buyNowBtn">Buy Now</button>
          </div>

          <div className="productInfoBox">
            <h4>Product Information</h4>
            <div className="infoGrid">
              <div className="infoItem">
                <strong>Category</strong>
                {product.category}
              </div>

              <div className="infoItem">
                <strong>Stock</strong>
                {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
              </div>

              <div className="infoItem">
                <strong>Selected Size</strong>
                {selectedSize || "Not selected"}
              </div>

              <div className="infoItem">
                <strong>Discount</strong>
                {product.discount > 0 ? `${product.discount}%` : "No discount"}
              </div>
            </div>
          </div>

          {similarProducts.length > 0 && (
            <div className="similarSection">
              <h3>People also viewed</h3>
              <div className="similarGrid">
                {similarProducts.map((item) => (
                  <div
                    key={item._id}
                    className="similarProductCard"
                    onClick={() => handleSimilarClick(item)}
                  >
                    <div className="similarProductImage">
                      <img src={item.image} alt={item.name} />
                    </div>

                    <div className="similarProductContent">
                      <h4>{item.name}</h4>
                      <p className="similarProductCategory">{item.category}</p>

                      <div className="similarPriceRow">
                        <span className="similarPrice">₹{item.price}.00</span>
                        {item.discount > 0 && (
                          <span className="similarDiscount">{item.discount}% OFF</span>
                        )}
                      </div>

                      <p className="similarStock">
                        {item.stock > 0 ? `${item.stock} left` : "Out of stock"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;