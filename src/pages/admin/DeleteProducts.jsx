import { useEffect, useState } from "react";
import { Trash2, Search, RefreshCw, AlertTriangle, X, Package } from "lucide-react";
//import { Allproducts,deleteProductApi } from "../.././services/authService"; // adjust path to your existing "get products" api
import "./DeleteProducts.css"
import { Allproducts,deleteProductApi } from "../../services/authService";
const DeleteProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmProduct, setConfirmProduct] = useState(null); // product pending delete confirmation
  const [toast, setToast] = useState(null); // { type: "success" | "error", message }


  
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    console.log("products loading")
    setLoading(true);
    try {
      console.log("Calling Allproducts API");
      const res = await Allproducts();
      console.log("API Response", res);
      setProducts(res?.data?.products || res?.data?.data || []);
    } catch (err) {
      console.log(err);
      showToast("error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteClick = (product) => {
    setConfirmProduct(product);
  };

  const handleConfirmDelete = async () => {
    if (!confirmProduct) return;
    const productId = confirmProduct._id;
    setDeletingId(productId);
    try {
      await deleteProductApi(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      showToast("success", `"${confirmProduct.name}" deleted successfully`);
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message || "Failed to delete product"
      );
    } finally {
      setDeletingId(null);
      setConfirmProduct(null);
    }
  };

  const filteredProducts = products.filter((p) =>
    p?.name?.toLowerCase().includes(search.toLowerCase())
  );

return (
  <div className="deleteProductsPage">

    <div className="deleteHeader">
      <div>
        <h1>Delete Products</h1>
        <p>Permanently remove products from your store catalog.</p>
      </div>

      <button
        onClick={fetchProducts}
        className="deleteRefreshBtn"
      >
        <RefreshCw size={18} />
        Refresh
      </button>
    </div>

    <div className="deleteSearchWrapper">
      <div className="deleteSearchBox">
        <Search size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product name..."
        />
      </div>
    </div>

    {loading ? (
      <div className="deleteLoading">
        <p>Loading products...</p>
      </div>
    ) : filteredProducts.length === 0 ? (
      <div className="deleteEmpty">
        <Package size={40} />
        <p>No products found</p>
      </div>
    ) : (
      <div className="deleteTableWrapper">
 <div className="deleteProductsGrid">
  {filteredProducts.map((product) => (
    <div
      key={product._id}
      className="deleteProductCard"
    >
      <img
        src={product.images?.[0] || "/placeholder.png"}
        alt={product.name}
        className="deleteProductImage"
      />

      <div className="deleteProductContent">
        <h4 className="deleteProductName">
          {product.name}
        </h4>

        <p className="deleteProductPrice">
          ₹{product.price}
        </p>

        <p className="deleteStock">
          Stock : {product.stock || 0}
        </p>

        <button
          onClick={() => handleDeleteClick(product)}
          disabled={deletingId === product._id}
          className="deleteBtn"
        >
          <Trash2 size={16} />
          {deletingId === product._id
            ? "Deleting..."
            : "Delete"}
        </button>
      </div>
    </div>
  ))}
</div>
      </div>
    )}

    {confirmProduct && (
      <div className="deleteModalOverlay">
        <div className="deleteModal">

          <div className="deleteModalHeader">

            <div className="deleteModalTitle">
              <div className="deleteWarningIcon">
                <AlertTriangle size={22} />
              </div>

              <div>
                <h2>Delete Product?</h2>
              </div>
            </div>

            <button
              className="closeDeleteModal"
              onClick={() => setConfirmProduct(null)}
            >
              <X size={18} />
            </button>

          </div>

          <p className="deleteModalText">
            You are about to permanently delete
            <strong> "{confirmProduct.name}" </strong>
            from your catalog.
          </p>

          <p className="deleteModalNote">
            This action cannot be undone and product
            images will also be removed.
          </p>

          <div className="deleteModalActions">

            <button
              className="cancelDeleteBtn"
              onClick={() => setConfirmProduct(null)}
            >
              Cancel
            </button>

            <button
              className="confirmDeleteBtn"
              onClick={handleConfirmDelete}
              disabled={
                deletingId === confirmProduct._id
              }
            >
              <Trash2 size={16} />

              {deletingId === confirmProduct._id
                ? "Deleting..."
                : "Delete Product"}
            </button>

          </div>
        </div>
      </div>
    )}

    {toast && (
      <div
        className={`deleteToast ${
          toast.type === "success"
            ? "success"
            : "error"
        }`}
      >
        {toast.message}
      </div>
    )}
  </div>
);
};

export default DeleteProducts;