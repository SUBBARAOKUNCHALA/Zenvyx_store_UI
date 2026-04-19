import React, { useMemo, useState } from "react";
import { addProductAdminApi } from "../../services/authService";
import "./AddProducts.css";

const categoryOptions = {
  Shirt: ["Formal Shirts", "Casual Shirts", "Printed Shirts", "Party Wear"],
  "T-Shirt": ["Round Neck", "Polo T-Shirts", "Cotton T-Shirts", "Oversized T-Shirts"],
  Pant: ["Jeans", "Cargo Pants", "Formal Pants", "Chinos"],
};

const sizeOptionsByCategory = {
  Shirt: ["S", "M", "L", "XL", "XXL","28", "30", "32", "34", "36", "38"],
  "T-Shirt": ["S", "M", "L", "XL", "XXL","28", "30", "32", "34", "36", "38"],
  Pant: ["28", "30", "32", "34", "36", "38","S", "M", "L", "XL", "XXL",],
};

const AddProducts = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
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
      const alreadySelected = prev.sizes.includes(selectedSize);

      return {
        ...prev,
        sizes: alreadySelected
          ? prev.sizes.filter((size) => size !== selectedSize)
          : [...prev.sizes, selectedSize],
      };
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files);

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
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

      if (images.length === 0) {
        setError("Please select at least one product image");
        return;
      }

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("subCategory", form.subCategory);
      formData.append("stock", form.stock);
      formData.append("discount", form.discount || 0);
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
                  required
                />
              </div>

              <div className="inputGroup fullWidth">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Enter product description"
                  value={form.description}
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
                <label>Sizes</label>

                {!form.category ? (
                  <p className="selectCategoryHint">Select category first to choose sizes.</p>
                ) : (
                  <div className="sizesButtonWrap">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        type="button"
                        className={`sizeSelectBtn ${
                          form.sizes.includes(size) ? "activeSize" : ""
                        }`}
                        onClick={() => toggleSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}

                {form.sizes.length > 0 && (
                  <div className="sizesList">
                    {form.sizes.map((size) => (
                      <span className="sizeTag" key={size}>
                        {size}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {previewUrls.length > 0 && (
                <div className="inputGroup fullWidth">
                  <label>Image Preview</label>
                  <div className="imagePreviewGrid">
                    {previewUrls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="previewImage"
                      />
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