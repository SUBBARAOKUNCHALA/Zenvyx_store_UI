import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [product, setProduct] = useState(location.state?.product || null);

  useEffect(() => {
    const fetchSingleProduct = async () => {
      try {
        if (!product) {
          // later replace with your real API call
          // const res = await getProductById(id);
          // setProduct(res.data.data);

          console.log("Fetch product by id:", id);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchSingleProduct();
  }, [id, product]);

  if (!product) {
    return <div style={{ padding: "100px 20px" }}>Loading product details...</div>;
  }

  return (
    <div className="productDetailsPage">
      <div className="productDetailsContainer">
        <div className="productDetailsImage">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="productDetailsContent">
          <h1>{product.name}</h1>
          <p className="productCategory">{product.category}</p>
          <p className="productPrice">₹{product.price}.00</p>
          <p className="productDescription">{product.description}</p>

          <div className="productSizesWrap">
            <h3>Available Sizes</h3>
            <div className="sizesList">
              {product.sizes?.map((size) => (
                <span key={size} className="detailSizeChip">
                  {size}
                </span>
              ))}
            </div>
          </div>

          <div className="productStock">
            {product.stock > 0 ? `${product.stock} items available` : "Out of stock"}
          </div>

          <div className="productActionBtns">
            <button className="detailCartBtn">Add to Cart</button>
            <button className="detailBuyBtn">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;