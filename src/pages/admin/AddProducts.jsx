import React, { useMemo, useState } from "react";
import { addProductAdminApi } from "../../services/authService";
import "./AddProducts.css";

const categoryOptions = {
  Shirt: ["Formal Shirts", "Casual Shirts", "Printed Shirts", "Party Wear"],
  "T-Shirt": ["Round Neck", "Polo T-Shirts", "Cotton T-Shirts", "Oversized T-Shirts"],
  Pant: ["Jeans", "Cargo Pants", "Formal Pants", "Chinos"],
};

const sizeOptionsByCategory = {
  Shirt: ["S", "M", "L", "XL", "XXL"],
  "T-Shirt": ["S", "M", "L", "XL", "XXL"],
  Pant: ["28", "30", "32", "34", "36", "38"],
};

const sizeCharts = {
  Shirt: {
    S: { chest: "36-38", shoulder: "17", length: "27" },
    M: { chest: "38-40", shoulder: "18", length: "28" },
    L: { chest: "40-42", shoulder: "19", length: "29" },
    XL: { chest: "42-44", shoulder: "20", length: "30" },
    XXL: { chest: "44-46", shoulder: "21", length: "31" },
  },

  "T-Shirt": {
    S: { chest: "36-38", length: "26-27" },
    M: { chest: "38-40", length: "27-28" },
    L: { chest: "40-42", length: "28-29" },
    XL: { chest: "42-44", length: "29-30" },
    XXL: { chest: "44-46", length: "30-31" },
  },

  Pant: {
    28: { waist: "28", length: "40-41" },
    30: { waist: "30", length: "40-41" },
    32: { waist: "32", length: "41-42" },
    34: { waist: "34", length: "41-42" },
    36: { waist: "36", length: "42-43" },
    38: { waist: "38", length: "42-43" },
  },
};

const AddProducts = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    ProductDetails: "",
    price: "",
    category: "",
    subCategory: "",
    stock: "",
    discount: "",
    sizes: [],
  });

  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const subCategoryOptions = useMemo(() => {
    return categoryOptions[form.category] || [];
  }, [form.category]);

  const sizeOptions = useMemo(() => {
    return sizeOptionsByCategory[form.category] || [];
  }, [form.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "category") {
      setForm((prev) => ({
        ...prev,
        category: value,
        subCategory: "",
        sizes: [],
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const toggleSize = (selectedSize) => {
    setForm((prev) => {
      const exists = prev.sizes.some(
        (item) => item.size === selectedSize
      );

      if (exists) {
        return {
          ...prev,
          sizes: prev.sizes.filter(
            (item) => item.size !== selectedSize
          ),
        };
      }

      return {
        ...prev,
        sizes: [
          ...prev.sizes,
          {
            size: selectedSize,
            stock: 1,
            measurements:
              sizeCharts[prev.category]?.[selectedSize] || {},
          },
        ],
      };
    });
  };
  const handleSizeStockChange = (selectedSize, value) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.map((item) =>
        item.size === selectedSize
          ? { ...item, stock: Number(value) }
          : item
      ),
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files);

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const moveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= images.length) return;

    const updatedImages = [...images];
    const updatedPreviewUrls = [...previewUrls];

    const [movedImage] = updatedImages.splice(fromIndex, 1);
    const [movedPreview] = updatedPreviewUrls.splice(fromIndex, 1);

    updatedImages.splice(toIndex, 0, movedImage);
    updatedPreviewUrls.splice(toIndex, 0, movedPreview);

    setImages(updatedImages);
    setPreviewUrls(updatedPreviewUrls);
  };

  const resetForm = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    setForm({
      name: "",
      description: "",
      ProductDetails: "",
      price: "",
      category: "",
      subCategory: "",
      stock: "",
      discount: "",
      sizes: [],
    });

    setImages([]);
    setPreviewUrls([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setError("");

      if (!form.category) {
        setError("Please select category");
        return;
      }

      if (!form.subCategory) {
        setError("Please select sub category");
        return;
      }

      if (form.sizes.length === 0) {
        setError("Please select at least one size");
        return;
      }

      const invalidSizeStock = form.sizes.some(
        (item) => item.stock === "" || Number(item.stock) < 0
      );

      if (invalidSizeStock) {
        setError("Please enter valid stock for selected sizes");
        return;
      }

      if (images.length === 0) {
        setError("Please select at least one product image");
        return;
      }

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("ProductDetails", form.ProductDetails);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("subCategory", form.subCategory);
      //formData.append("stock", form.stock);
      formData.append("discount", form.discount || 0);
      //formData.append("sizes", JSON.stringify(form.sizes));
      const totalStock = form.sizes.reduce(
        (sum, item) => sum + Number(item.stock || 0),
        0
      );

      formData.append("stock", totalStock);
      formData.append("sizes", JSON.stringify(form.sizes));

      images.forEach((file) => {
        formData.append("images", file);
      });

      const res = await addProductAdminApi(formData);

      setMessage(res?.data?.message || "Product added successfully");
      resetForm();
    } catch (err) {
      console.error("Add product error:", err);
      setError(err?.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addProductsPage">
      <div className="addProductsContainer">
        <div className="addProductsHeader">
          <h1>Add Product</h1>
          <p>Create and upload a new product to your store.</p>
        </div>

        <div className="addProductsCard">
          {message && <div className="addProductSuccess">{message}</div>}
          {error && <div className="addProductError">{error}</div>}

          <form className="addProductsForm" onSubmit={handleSubmit}>
            <div className="addProductsGrid">
              <div className="inputGroup fullWidth">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter product name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={20}
                  required
                />
              </div>

              <div className="inputGroup fullWidth">
                <label>Description</label>
                <input
                  name="description"
                  placeholder="Enter product description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={30}
                  required
                />
              </div>

              <div className="inputGroup fullWidth">
                <label>ProductDetails</label>
                <textarea
                  name="ProductDetails"
                  placeholder="Enter product ProductDetails"
                  value={form.ProductDetails}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>

              <div className="inputGroup">
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  placeholder="Enter price"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="inputGroup">
                <label>Stock</label>
                <input
                  type="number"
                  name="stock"
                  placeholder="Enter stock"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="inputGroup">
                <label>Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Shirt">Shirt</option>
                  <option value="T-Shirt">T-Shirt</option>
                  <option value="Pant">Pant</option>
                </select>
              </div>

              <div className="inputGroup">
                <label>Sub Category</label>
                <select
                  name="subCategory"
                  value={form.subCategory}
                  onChange={handleChange}
                  required
                  disabled={!form.category}
                >
                  <option value="">Select sub category</option>
                  {subCategoryOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="inputGroup">
                <label>Discount</label>
                <input
                  type="number"
                  name="discount"
                  placeholder="Enter discount"
                  value={form.discount}
                  onChange={handleChange}
                />
              </div>

              <div className="inputGroup">
                <label>Product Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
              </div>

              <div className="inputGroup fullWidth">
                <label>Sizes & Quantity</label>

                {!form.category ? (
                  <p className="selectCategoryHint">
                    Select category first to choose sizes.
                  </p>
                ) : (
                  <div className="sizesButtonWrap">
                    {sizeOptions.map((size) => {
                      const selected = form.sizes.some((item) => item.size === size);

                      return (
                        <button
                          key={size}
                          type="button"
                          className={`sizeSelectBtn ${selected ? "activeSize" : ""}`}
                          onClick={() => toggleSize(size)}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                )}

                {form.sizes.length > 0 && (
                  <div className="sizeStockGrid">
                    {form.sizes.map((item) => (
                      <div className="sizeStockBox" key={item.size}>
                        <div className="sizeStockInfo">
                          <span className="sizeStockLabel">
                            {item.size}
                          </span>

                          <input
                            type="number"
                            min="0"
                            value={item.stock}
                            onChange={(e) =>
                              handleSizeStockChange(item.size, e.target.value)
                            }
                            placeholder="Qty"
                          />

                          <div className="measurementInfo">
                            {item.measurements?.chest && (
                              <span>
                                Chest: {item.measurements.chest}
                              </span>
                            )}

                            {item.measurements?.shoulder && (
                              <span>
                                Shoulder: {item.measurements.shoulder}
                              </span>
                            )}

                            {item.measurements?.waist && (
                              <span>
                                Waist: {item.measurements.waist}
                              </span>
                            )}

                            {item.measurements?.length && (
                              <span>
                                Length: {item.measurements.length}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="removeSizeBtn"
                          onClick={() => toggleSize(item.size)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {previewUrls.length > 0 && (
                <div className="inputGroup fullWidth">
                  <label>Image Preview</label>

                  <div className="imagePreviewGrid">
                    {previewUrls.map((url, index) => (
                      <div className="previewImageBox" key={index}>
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="previewImage"
                        />

                        <span className="imageOrderBadge">{index + 1}</span>

                        <div className="imageMoveActions">
                          <button
                            type="button"
                            onClick={() => moveImage(index, index - 1)}
                            disabled={index === 0}
                          >
                            ←
                          </button>

                          <button
                            type="button"
                            onClick={() => moveImage(index, index + 1)}
                            disabled={index === previewUrls.length - 1}
                          >
                            →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="submitProductBtn" type="submit" disabled={loading}>
              {loading ? "Uploading Product..." : "Add Product"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProducts;