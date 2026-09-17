import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Alert, Spinner } from "../components/common";
import "./Auth.css";

function Login({ adminMode = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If redirected here from a protected page, go back there after login
  const from = location.state?.from || (adminMode ? "/admin" : "/complaints");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoginError("");
    setIsSubmitting(true);
    const result = await login(data.email, data.password);
    setIsSubmitting(false);
    if (result.success && adminMode && result.user?.role !== "admin") {
      await logout();
      setLoginError("This account does not have administrator access.");
    } else if (result.success) {
      navigate(from, { replace: true });
    } else {
      setLoginError(result.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      <div className="auth-card">
        {/* Brand */}
        <Link to="/" className="auth-brand">
          <span className="auth-brand-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18M5 21V7l5-3v17M10 21V11l5-2v12M15 21V4l5 2v15" />
              <path d="M7.5 10.5h.01M7.5 14.5h.01M12.5 14.5h.01M17 9.5h.01M17 13.5h.01" />
            </svg>
          </span>
          <span className="auth-brand-name">
            Smart<span className="auth-brand-accent">City</span>
          </span>
        </Link>

        {/* Heading */}
        <div className="auth-heading">
          <h1 className="auth-title">{adminMode ? "Admin sign in" : "Welcome back"}</h1>
          <p className="auth-subtitle">
            {adminMode ? "Access the complaint management workspace" : "Sign in to track and manage your complaints"}
          </p>
        </div>

        {/* Error banner */}
        {loginError && (
          <Alert type="error" message={loginError} onClose={() => setLoginError("")} />
        )}

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">Email Address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">✉️</span>
              <input
                id="login-email"
                type="email"
                className={`auth-input ${errors.email ? "auth-input-error" : ""}`}
                placeholder="you@example.com"
                autoComplete="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />
            </div>
            {errors.email && <span className="auth-error">⚠ {errors.email.message}</span>}
          </div>

          {/* Password */}
          <div className="auth-field">
            <div className="auth-label-row">
              <label className="auth-label" htmlFor="login-password">Password</label>
              <a href="#" className="auth-forgot">Forgot password?</a>
            </div>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔒</span>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className={`auth-input auth-input-padded ${errors.password ? "auth-input-error" : ""}`}
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "At least 6 characters" },
                })}
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <span className="auth-error">⚠ {errors.password.message}</span>}
          </div>

          {/* Remember me */}
          <label className="auth-remember">
            <input type="checkbox" className="auth-checkbox" />
            <span>Keep me signed in</span>
          </label>

          {/* Submit */}
          <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" color="#fff" /> : "Sign In →"}
          </button>

        </form>

        {/* Hint */}
        {!adminMode && <div className="auth-hint-box">
          <span className="auth-hint-icon">💡</span>
          <span>Test: <strong>test@smartcity.com</strong> / <strong>password123</strong></span>
        </div>}

        {/* Divider */}
        <div className="auth-divider"><span>or</span></div>

        {/* Register nudge */}
        {!adminMode && <div className="auth-nudge">
          <p className="auth-nudge-text">Don't have an account?</p>
          <Link to="/register" className="auth-nudge-btn">
            Create a Free Account
          </Link>
          <p className="auth-nudge-hint">Join thousands of citizens improving their city.</p>
        </div>}

        {!adminMode && <Link to="/admin/login" className="auth-admin-link">Administrator sign in</Link>}

      </div>
    </div>
  );
}

export default Login;