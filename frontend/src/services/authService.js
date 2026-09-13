import api from "./api";
import { API_ENDPOINTS } from "./apiContracts";
import { MOCK_USER } from "./mockData";

export const authService = {
  /**
   * Login user with email and password
   * Attempts live API first; falls back to mock if backend is offline.
   */
  async login(email, password) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      if (response.data?.token) {
        sessionStorage.setItem("sc_token", response.data.token);
      }
      if (response.data?.user) {
        sessionStorage.setItem("sc_user", JSON.stringify(response.data.user));
      }
      return { success: true, user: response.data?.user };
    } catch {
      // Offline / mock fallback
      await new Promise((r) => setTimeout(r, 600)); // Simulate realistic network delay

      if (email === "test@smartcity.com" && password === "password123") {
        const user = { ...MOCK_USER, email };
        sessionStorage.setItem("sc_token", "mock-jwt-token-xyz");
        sessionStorage.setItem("sc_user", JSON.stringify(user));
        return { success: true, user };
      }

      return {
        success: false,
        message: "Invalid email or password. Try test@smartcity.com / password123",
      };
    }
  },

  /**
   * Register a new user
   */
  async register(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      if (response.data?.token) {
        sessionStorage.setItem("sc_token", response.data.token);
      }
      if (response.data?.user) {
        sessionStorage.setItem("sc_user", JSON.stringify(response.data.user));
      }
      return { success: true, user: response.data?.user };
    } catch {
      // Offline / mock fallback
      await new Promise((r) => setTimeout(r, 600));

      const initials = (userData.fullName || "User")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      const newUser = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        name: userData.fullName,
        email: userData.email,
        initials,
        city: userData.city || "Your City",
        joinedAt: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      };

      sessionStorage.setItem("sc_token", "mock-jwt-token-registered");
      sessionStorage.setItem("sc_user", JSON.stringify(newUser));
      return { success: true, user: newUser };
    }
  },

  /**
   * Logout user and clear tokens
   */
  async logout() {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Ignore network errors on logout
    } finally {
      sessionStorage.removeItem("sc_token");
      sessionStorage.removeItem("sc_user");
    }
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
    return !!sessionStorage.getItem("sc_user");
  },
};

export default authService;
