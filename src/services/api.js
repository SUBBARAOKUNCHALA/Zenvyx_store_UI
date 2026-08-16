import axios from "axios";
import { startLoading, stopLoading } from "../services/loaderService";

const api = axios.create({
  //baseURL: "http://localhost:5000/api",
  baseURL: "https://zenvyx-store.onrender.com/api",
});

api.interceptors.request.use((config) => {
  if (!config.skipGlobalLoader) {
    startLoading();
  }

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (!response.config?.skipGlobalLoader) {
      stopLoading();
    }
    return response;
  },
  (error) => {
    if (!error.config?.skipGlobalLoader) {
      stopLoading();
    }

    if (
      error.response?.status === 401 &&
      error.response?.data?.message?.toLowerCase().includes("expired")
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;