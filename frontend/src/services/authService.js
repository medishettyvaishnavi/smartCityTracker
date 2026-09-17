import api from "./api";
import { API_ENDPOINTS } from "./apiContracts";

export const authService = {
  /**
   * Login user with email and password
   */
  async login(email, password) {
    try {
      const response = await api.post(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          email,
          password,
        }
      );

      if (response.data?.token) {
        sessionStorage.setItem(
          "sc_token",
          response.data.token
        );
      }

      if (response.data?.user) {
        sessionStorage.setItem(
          "sc_user",
          JSON.stringify(response.data.user)
        );
      }

      return {
        success: true,
        user: response.data?.user,
        message: response.data?.message,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.request
          ? "Unable to connect to the server"
          : error.message || "Login failed");

      return {
        success: false,
        message,
        error,
      };
    }
  },

  /**
   * Register a new user
   */
  async register(userData) {
    try {
      const response = await api.post(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      );

      return {
        success: true,
        user: response.data?.user,
        message: response.data?.message,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.request
          ? "Unable to connect to the server"
          : error.message || "Registration failed");

      return {
        success: false,
        message,
        error,
      };
    }
  },

  /**
   * Logout user and clear tokens
   */
  async logout() {
    sessionStorage.removeItem("sc_token");
    sessionStorage.removeItem("sc_user");
  },

  /**
   * Get current authenticated user from storage
   */
  getCurrentUser() {
    try {
      const raw = sessionStorage.getItem("sc_user");

      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!sessionStorage.getItem("sc_token");
  },

  /**
   * Fetch current user profile from backend
   */
  async getProfile() {
    try {
      const response = await api.get("/auth/me");
      if (response.data?.user) {
        sessionStorage.setItem("sc_user", JSON.stringify(response.data.user));
        return response.data.user;
      }
      return null;
    } catch {
      return null;
    }
  },
};

export default authService;