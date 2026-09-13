import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

/**
 * Pre-configured Axios instance for Smart City Tracker
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor:
 * Attaches Authorization header if JWT token is stored
 */
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("sc_token") || localStorage.getItem("sc_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * Standardizes errors and handles 401 Unauthorized (expired token)
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with an error status
      const { status, data } = error.response;

      if (status === 401) {
        // Token expired or invalid
        sessionStorage.removeItem("sc_token");
        sessionStorage.removeItem("sc_user");
        // We avoid hard window.location here to let React Router handle state,
        // but dispatch an event for any auth listeners
        window.dispatchEvent(new CustomEvent("sct:auth-expired"));
      }

      const message = data?.message || `Request failed with status ${status}`;
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Network error or server not running
      return Promise.reject(new Error("Network error: Unable to connect to server."));
    } else {
      return Promise.reject(error);
    }
  }
);

export default api;
