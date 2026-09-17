import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps any route that requires authentication.
 * Waits for auth hydration before deciding to redirect,
 * so a page reload doesn't blink to /login and back.
 */
function ProtectedRoute({ children, requiredRole }) {
  const { isLoggedIn, isLoading, user } = useAuth();
  const location = useLocation();

  // Still reading sessionStorage — render nothing (no blink)
  if (isLoading) return null;

  if (!isLoggedIn) {
    return <Navigate to={requiredRole === "admin" ? "/admin/login" : "/login"} state={{ from: location.pathname }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
