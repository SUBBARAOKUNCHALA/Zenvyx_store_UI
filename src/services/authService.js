import API from "./api";

export const registerUser = (data) => API.post("/auth/register", data);
export const googleAuthUser = (data) => API.post("/auth/google", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const sendOtp = (data) => API.post("/auth/send-otp", data);
export const validateOtp = (data) => API.post("/auth/validate-otp", data);
export const resetPasswordWithOtp = (data) =>
  API.post("/auth/reset-password", data);

export const Allproducts = () => API.get("/products");
export const getProductById = (id) => API.get(`/products/${id}`);
export const getSimilarProducts = (id) => API.get(`/products/${id}/similar`);

export const addToCartApi = (data) => API.post("/cart/add", data);
export const getMyCartApi = () => API.get("/cart");
export const updateCartQuantityApi = (cartItemId, data) =>
  API.put(`/cart/update/${cartItemId}`, data);
export const removeCartItemApi = (cartItemId) =>
  API.delete(`/cart/remove/${cartItemId}`);
export const clearMyCartApi = () => API.delete("/cart/clear");

// ADDRESS
export const addAddressApi = (data) => API.post("/address/add", data);
export const getMyAddressesApi = () => API.get("/address/my-addresses");
export const getDefaultAddressApi = () => API.get("/address/default");
export const updateAddressApi = (id, data) =>
  API.put(`/address/update/${id}`, data);
export const deleteAddressApi = (id) => API.delete(`/address/delete/${id}`);
export const setDefaultAddressApi = (id) =>
  API.put(`/address/set-default/${id}`);

// ORDERS
export const getCheckoutSummaryApi = () => API.get("/orders/checkout-summary");
export const placeOrderApi = (data) => API.post("/orders/place", data);
export const getMyOrdersApi = () => API.get("/orders/my-orders");
export const getOrderByIdApi = (orderId) => API.get(`/orders/${orderId}`);
export const cancelMyOrderApi = (orderId, data) =>
  API.put(`/orders/${orderId}/cancel`, data);

// ADMIN APIS
export const adminLoginApi = (data) => API.post("/admin/login", data);
export const addProductAdminApi = (formData) => {
  const adminToken = localStorage.getItem("adminToken");

  return API.post("/products/add", formData, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "multipart/form-data",
    },

  });
};
export const getAdminDashboardApi = () => {
  const adminToken = localStorage.getItem("adminToken");

  return API.get("/admin/dashboard", {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
};

export const getAllOrdersApi = () => {
  const adminToken = localStorage.getItem("adminToken");

  return API.get("/admin/all", {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
};

export const updateOrderStatusApi = (orderId, data) => {
  const adminToken = localStorage.getItem("adminToken");

  return API.put(`/admin/${orderId}/status`, data, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
};