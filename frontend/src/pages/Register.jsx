import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const PERKS = [
  { icon: "📢", text: "Report city issues in seconds" },
  { icon: "📍", text: "Track complaints in real-time" },
  { icon: "🔔", text: "Get notified on every update" },
  { icon: "🌱", text: "Help build a better city" },
];

function Register() {
  const navigate = useNavigate();
  const { loginWithData } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password", "");

  const onSubmit = async (data) => {
    await new Promise((r) => setTimeout(r, 1300));
    console.log("Registered:", data);
    // Auto-login with new account
    loginWithData(data);
    navigate("/complaints", { replace: true });
  };

  if (submitted) {
    return (
      <div className="auth-wrapper">
        <div className="auth-glow auth-glow-1" />
        <div className="auth-glow auth-glow-2" />
        <div className="auth-card auth-success-card">
          <div className="auth-success-icon">🎉</div>
          <h2 className="auth-success-title">Account Created!</h2>
          <p className="auth-success-sub">
            Welcome to SmartCity! You can now report issues and track complaints.
          </p>
          <Link to="/login" className="auth-submit-btn" style={{ display: "block", textAlign: "center" }}>
            Go to Login →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper auth-wrapper-wide">
      {/* Background glows */}
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      <div className="auth-split">

        {/* ── Left panel — perks ───────────────────────── */}
        <div className="auth-panel-left">
          <div className="auth-brand auth-brand-white">
            <span className="auth-brand-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M5 21V7l5-3v17M10 21V11l5-2v12M15 21V4l5 2v15" />
                <path d="M7.5 10.5h.01M7.5 14.5h.01M12.5 14.5h.01M17 9.5h.01M17 13.5h.01" />
              </svg>
            </span>
            <span className="auth-brand-name">
              Smart<span className="auth-brand-accent">City</span>
            </span>
          </div>

          <h2 className="auth-panel-title">
            Join thousands of citizens making their city better.
          </h2>
          <p className="auth-panel-sub">
            Create a free account in under 60 seconds. No paperwork, no queues.
          </p>

          <ul className="auth-perks">
            {PERKS.map((p) => (
              <li key={p.text} className="auth-perk-item">
                <span className="auth-perk-icon">{p.icon}</span>
                <span>{p.text}</span>
              </li>
            ))}
          </ul>

          <div className="auth-already">
            Already have an account?{" "}
            <Link to="/login" className="auth-already-link">Log in →</Link>
          </div>
        </div>

        {/* ── Right panel — form ───────────────────────── */}
        <div className="auth-card auth-card-right">

          <div className="auth-heading">
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">Free forever · No credit card needed</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Full Name + Phone — row */}
            <div className="auth-row">
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-name">Full Name</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">👤</span>
                  <input
                    id="reg-name"
                    type="text"
                    className={`auth-input ${errors.fullName ? "auth-input-error" : ""}`}
                    placeholder="Jane Doe"
                    {...register("fullName", {
                      required: "Full name is required",
                      minLength: { value: 2, message: "At least 2 characters" },
                    })}
                  />
                </div>
                {errors.fullName && <span className="auth-error">⚠ {errors.fullName.message}</span>}
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-phone">Phone Number</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">📞</span>
                  <input
                    id="reg-phone"
                    type="tel"
                    className={`auth-input ${errors.phone ? "auth-input-error" : ""}`}
                    placeholder="+91 98765 43210"
                    {...register("phone", {
                      required: "Phone is required",
                      pattern: {
                        value: /^[+]?[\d\s\-()]{7,15}$/,
                        message: "Enter a valid phone number",
                      },
                    })}
                  />
                </div>
                {errors.phone && <span className="auth-error">⚠ {errors.phone.message}</span>}
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-email">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input
                  id="reg-email"
                  type="email"
                  className={`auth-input ${errors.email ? "auth-input-error" : ""}`}
                  placeholder="jane@example.com"
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

            {/* Password + Confirm — row */}
            <div className="auth-row">
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-password">Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    className={`auth-input auth-input-padded ${errors.password ? "auth-input-error" : ""}`}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "At least 8 characters" },
                    })}
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && <span className="auth-error">⚠ {errors.password.message}</span>}
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-confirm">Confirm Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    id="reg-confirm"
                    type={showConfirm ? "text" : "password"}
                    className={`auth-input auth-input-padded ${errors.confirm ? "auth-input-error" : ""}`}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    {...register("confirm", {
                      required: "Please confirm your password",
                      validate: (val) => val === password || "Passwords do not match",
                    })}
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShowConfirm((v) => !v)}
                    tabIndex={-1}
                  >
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.confirm && <span className="auth-error">⚠ {errors.confirm.message}</span>}
              </div>
            </div>

            {/* Ward / City */}
            <div className="auth-row">
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-city">City</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">📍</span>
                  <input
                    id="reg-city"
                    type="text"
                    className={`auth-input ${errors.city ? "auth-input-error" : ""}`}
                    placeholder="e.g. Bengaluru"
                    {...register("city", { required: "City is required" })}
                  />
                </div>
                {errors.city && <span className="auth-error">⚠ {errors.city.message}</span>}
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-pincode">PIN Code</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">📮</span>
                  <input
                    id="reg-pincode"
                    type="text"
                    className={`auth-input ${errors.pincode ? "auth-input-error" : ""}`}
                    placeholder="560001"
                    maxLength={6}
                    {...register("pincode", {
                      required: "PIN code is required",
                      pattern: { value: /^\d{6}$/, message: "6-digit PIN code" },
                    })}
                  />
                </div>
                {errors.pincode && <span className="auth-error">⚠ {errors.pincode.message}</span>}
              </div>
            </div>

            {/* Terms */}
            <div className="auth-field">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  className="auth-checkbox"
                  {...register("terms", { required: "You must accept the terms" })}
                />
                <span>
                  I agree to the{" "}
                  <a href="#" className="auth-link">Terms of Service</a>{" "}
                  and{" "}
                  <a href="#" className="auth-link">Privacy Policy</a>
                </span>
              </label>
              {errors.terms && <span className="auth-error">⚠ {errors.terms.message}</span>}
            </div>

            {/* Submit */}
            <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? <span className="auth-spinner" /> : "Create Account →"}
            </button>

          </form>

          <p className="auth-login-link">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">Sign in instead</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;