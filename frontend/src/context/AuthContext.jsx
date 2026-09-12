import { createContext, useContext, useState, useCallback } from "react";

/* ── Auth Context ─────────────────────────────────────── */
const AuthContext = createContext(null);

/* Mock user data that gets "returned" on login */
const MOCK_USER = {
  name: "Vaishnavi M.",
  email: "test@smartcity.com",
  initials: "VM",
  city: "Bengaluru",
  joinedAt: "September 2026",
};

export function AuthProvider({ children }) {
  // Persist auth across page refreshes via sessionStorage
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem("sc_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((email, password) => {
    // Mock credential check — swap with real API call later
    if (email === "test@smartcity.com" && password === "password123") {
      const userData = { ...MOCK_USER, email };
      setUser(userData);
      sessionStorage.setItem("sc_user", JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: "Invalid email or password. Try test@smartcity.com / password123" };
  }, []);

  const loginWithData = useCallback((userData) => {
    // Used after registration
    const newUser = {
      name: userData.fullName,
      email: userData.email,
      initials: userData.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      city: userData.city || "Your City",
      joinedAt: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    };
    setUser(newUser);
    sessionStorage.setItem("sc_user", JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("sc_user");
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
