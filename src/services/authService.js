import API from "./api";
import adminAPI from "./adminApi";

// ---- USER APIs (use API) ----
export const registerUser = (data) => API.post("/auth/register", data);
export const googleAuthUser = (data) => API.post("/auth/google", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const sendOtp = (data) => API.post("/auth/send-otp", data);
export const validateOtp = (data) => API.post("/auth/validate-otp", data);
export const resetPasswordWithOtp = (data) => API.post("/auth/reset-password", data);

export const createRazorpayOrderApi = (data) => API.post("/payment/create-order", data);
export const verifyRazorpayPaymentApi = (data) => API.post("/payment/verify", data);

export const Allproducts = (page = 1, limit = 12) =>
  API.get(`/products?page=${page}&limit=${limit}`, { skipGlobalLoader: true });
export const getProductById = (id) => API.get(`/products/${id}`);
export const getnewcollections=()=> API.get("/products/new-collections");
export const getSimilarProducts = (id) => API.get(`/products/${id}/similar`);

export const addToCartApi = (data) => API.post("/cart/add", data);
export const getMyCartApi = () => API.get("/cart");
export const updateCartQuantityApi = (cartItemId, data) => API.put(`/cart/update/${cartItemId}`, data);
export const removeCartItemApi = (cartItemId) => API.delete(`/cart/remove/${cartItemId}`);
export const clearMyCartApi = () => API.delete("/cart/clear");

export const addAddressApi = (data) => API.post("/address/add", data);
export const getMyAddressesApi = () => API.get("/address/my-addresses");
export const getDefaultAddressApi = () => API.get("/address/default");
export const updateAddressApi = (id, data) => API.put(`/address/update/${id}`, data);
export const deleteAddressApi = (id) => API.delete(`/address/delete/${id}`);
export const setDefaultAddressApi = (id) => API.put(`/address/set-default/${id}`);

// wishlist — no need to manually pass Authorization anymore, interceptor handles it
export const toggleWishlistApi = (productId) => API.post(`/wishlist/toggle/${productId}`, {});
export const getWishlistApi = () => API.get("/wishlist");
export const removeWishlistApi = (productId) => API.delete(`/wishlist/${productId}`);

// contact us system apis
export const createContactApi=(data)=> API.post("/contact/createRequest",data);

export const getCheckoutSummaryApi = () => API.get("/orders/checkout-summary");
export const placeOrderApi = (data) => API.post("/orders/place", data);
export const getMyOrdersApi = () => API.get("/orders/my-orders");
export const getOrderByIdApi = (orderId) => API.get(`/orders/${orderId}`);
export const cancelMyOrderApi = (orderId, data) => API.put(`/orders/${orderId}/cancel`, data);
export const returnOrderApi = (orderId, data) => API.put(`/orders/${orderId}/return`, data);
export const downloadInvoiceApi = (orderId) => API.get(`/orders/${orderId}/invoice`, { responseType: "blob" });

// ---- ADMIN APIs (use adminAPI — no manual headers needed anymore) ----
export const adminLoginApi = (data) => API.post("/admin/login", data); // login itself has no token yet, keep on API
export const addProductAdminApi = (formData) =>
  adminAPI.post("/products/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getAdminDashboardApi = () => adminAPI.get("/admin/dashboard");
export const getAllOrdersApi = () => adminAPI.get("/admin/all");
export const updateOrderStatusApi = (orderId, data) => adminAPI.put(`/admin/${orderId}/status`, data);
export const getReturnedOrdersApi = () => adminAPI.get("/admin/returns");
export const updateReturnedOrderStatusApi = (returnId, data) => adminAPI.put(`/admin/returns/${returnId}/status`, data);
export const deleteProductApi = (productId) => adminAPI.delete(`/admin/${productId}`);
export const getAdminPaymentsApi = (params = {}) => adminAPI.get("/admin/payments", { params });
export const downloadAdminPaymentsCsvApi = (params = {}) =>
  adminAPI.get("/admin/payments/export/csv", { params, responseType: "blob" });