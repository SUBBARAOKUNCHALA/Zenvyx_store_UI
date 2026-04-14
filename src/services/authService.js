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