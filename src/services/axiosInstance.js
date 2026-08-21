// services/axiosInstance.js
import axios from "axios";
import API from "./api";

const axiosInstance = axios.create({
    baseURL: API,
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {

        if (!error.response) {
            // server unreachable / network error / CORS blocked
            document.dispatchEvent(new CustomEvent("server-down"));
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;