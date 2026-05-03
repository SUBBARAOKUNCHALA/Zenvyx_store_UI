import axios from "axios";

const api = axios.create({
  //baseURL: "http://localhost:5000/api",
  baseURL:"https://zenvyx-store.onrender.com/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("User Token",token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
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

export default api;