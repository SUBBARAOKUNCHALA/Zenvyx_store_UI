import axios from "axios";

const API = axios.create({
  baseURL: "https://zenvyx-store.onrender.com/api",
  //baseURL:"http://localhost:5000/api"
});

console.log("API BASE URL:", API.defaults.baseURL);

// Auto-attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;