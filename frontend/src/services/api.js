import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

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
    const token =
      sessionStorage.getItem("sc_token") ||
      localStorage.getItem("sc_token");

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
 * Standardizes errors and handles 401 Unauthorized
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        sessionStorage.removeItem("sc_token");
        sessionStorage.removeItem("sc_user");

        window.dispatchEvent(new CustomEvent("sct:auth-expired"));
      }

      const message =
        data?.message || `Request failed with status ${status}`;

      const err = new Error(message);
      err.response = error.response;
      return Promise.reject(err);
    } else if (error.request) {
      const err = new Error("Network error: Unable to connect to server.");
      err.request = error.request;
      return Promise.reject(err);
    } else {
      return Promise.reject(error);
    }
  }
);

export default api;