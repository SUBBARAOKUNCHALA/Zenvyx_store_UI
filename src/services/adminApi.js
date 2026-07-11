import axios from "axios";
import { startLoading, stopLoading } from "../services/loaderService";

const adminApi = axios.create({
    //baseURL: "http://localhost:5000/api",
  baseURL: "https://zenvyx-store.onrender.com/api",
});

adminApi.interceptors.request.use((config) => {
  startLoading();
  const adminToken = localStorage.getItem("adminToken");
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => {
    stopLoading();
    return response;
  },
  (error) => {
    stopLoading();
    if (
      error.response?.status === 401 &&
      error.response?.data?.message?.toLowerCase().includes("expired")
    ) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      window.location.href = "/~fiadmin/login";
    }
    return Promise.reject(error);
  }
);

export default adminApi;