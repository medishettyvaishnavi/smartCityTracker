import { createContext, useContext, useState, useCallback, useEffect } from "react";
import authService from "../services/authService";

/* ── Auth Context ─────────────────────────────────────── */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Read authenticated user state via authService
  const [user, setUser] = useState(() => authService.getCurrentUser());

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
    };
    window.addEventListener("sct:auth-expired", handleAuthExpired);
    return () => window.removeEventListener("sct:auth-expired", handleAuthExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, message: result.message };
  }, []);

  const loginWithData = useCallback(async (userData) => {
    const result = await authService.register(userData);
    if (result.success) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, message: result.message };
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, loginWithData, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
