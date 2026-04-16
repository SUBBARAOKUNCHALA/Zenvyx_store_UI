import API from "./api";

export const registerUser = (data) => API.post("/auth/register", data);
export const googleAuthUser = (data) => API.post("/auth/google", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const sendOtp = (data) => API.post("/auth/send-otp", data);
export const validateOtp = (data) => API.post("/auth/validate-otp", data);
export const resetPasswordWithOtp = (data) =>
  API.post("/auth/reset-password", data);

export const Allproducts=()=>API.get("/products")
export const getProductById = (id) => API.get(`/products/${id}`);
export const getSimilarProducts = (id) => API.get(`/products/${id}/similar`);

export const addToCartApi = (data) => API.post("/cart/add", data);
export const getMyCartApi = () => API.get("/cart");
export const updateCartQuantityApi = (cartItemId, data) =>
  API.put(`/cart/update/${cartItemId}`, data);
export const removeCartItemApi = (cartItemId) =>
  API.delete(`/cart/remove/${cartItemId}`);
export const clearMyCartApi = () => API.delete("/cart/clear");