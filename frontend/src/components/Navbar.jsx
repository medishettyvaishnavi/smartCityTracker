import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./Navbar.css";

/* Links shown only when logged in */
const AUTH_NAV_LINKS = [
  { to: "/", label: "Home", exact: true },
  { to: "/complaints", label: "My Complaints" },
];

function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef(null);

  // Derive initials from name — backend has no 'initials' field
  const initials = user?.name
    ? user.name.trim().split(/\s+/).map((w) => w[0].toUpperCase()).slice(0, 2).join("")
    : "?";

  // Real user location (read directly from authenticated user; no mock data)
  const userLocation =
    user?.city ||
    (typeof user?.location === "string" ? user.location : user?.location?.city) ||
    null;

  const userJoined = user?.joinedAt || user?.createdAt;
  const displayJoined = userJoined
    ? new Date(userJoined).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : null;


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close avatar dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLinkClick = () => {
    setMenuOpen(false);
    setAvatarOpen(false);
  };

  const handleLogout = () => {
    logout();
    setAvatarOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className={`nav-root ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="nav-inner">

        {/* ── Brand ─────────────────────────────────── */}
        <Link to="/" className="nav-brand" onClick={handleLinkClick}>
          <span className="nav-brand-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18M5 21V7l5-3v17M10 21V11l5-2v12M15 21V4l5 2v15" />
              <path d="M7.5 10.5h.01M7.5 14.5h.01M12.5 14.5h.01M17 9.5h.01M17 13.5h.01" />
            </svg>
          </span>
          <span className="nav-brand-text">
            Smart<span className="nav-brand-accent">City</span>
          </span>
        </Link>

        {/* ── Desktop Nav Links (logged-in only) ────── */}
        {isLoggedIn && (
          <div className="nav-links">
            {AUTH_NAV_LINKS.map(({ to, label, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "nav-link-active" : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}

        {/* ── Right Side ────────────────────────────── */}
        <div className="nav-right">

          {isLoggedIn ? (
            /* ── Logged-in state ─────────────────────── */
            <>
              <Link to="/report" className="nav-cta" onClick={handleLinkClick}>
                + Report Issue
              </Link>

              {/* Avatar dropdown */}
              <div className="nav-avatar-wrap" ref={avatarRef}>
                <button
                  className="nav-avatar-btn"
                  onClick={() => setAvatarOpen((v) => !v)}
                  aria-label="Account menu"
                  aria-expanded={avatarOpen}
                  title={user?.name || "Account"}
                >
                  <span className="nav-avatar-initials">{initials}</span>
                </button>

                {avatarOpen && (
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-user">
                      <div className="nav-dropdown-avatar">{initials}</div>
                      <div>
                        <div className="nav-dropdown-name">{user?.name}</div>
                        <div className="nav-dropdown-email">{user?.email}</div>
                      </div>
                    </div>
                    <div className="nav-dropdown-divider" />
                    <div className="nav-dropdown-meta">
                      <span>📍 {userLocation || "Location not set"}</span>
                      {displayJoined && <span>🗓️ Joined {displayJoined}</span>}
                    </div>
                    <div className="nav-dropdown-divider" />
                    <Link to="/complaints" className="nav-dropdown-item" onClick={handleLinkClick}>
                      📋 My Complaints
                    </Link>
                    <Link to="/report" className="nav-dropdown-item" onClick={handleLinkClick}>
                      📢 Report Issue
                    </Link>
                    <div className="nav-dropdown-divider" />
                    <button className="nav-dropdown-logout" onClick={handleLogout}>
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ── Logged-out state ────────────────────── */
            <>
              <Link to="/login" className="nav-login-btn" onClick={handleLinkClick}>
                Log In
              </Link>
              <Link to="/register" className="nav-signup-btn" onClick={handleLinkClick}>
                Sign Up
              </Link>
            </>
          )}

          {/* Theme Toggle Button */}
          <button
            className="nav-theme-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
            title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
          >
            <span className="nav-theme-icon">{isDark ? "☀️" : "🌙"}</span>
            <span className="nav-theme-label">{isDark ? "Light" : "Dark"}</span>
          </button>

          {/* Hamburger — always visible on mobile */}
          <button
            className={`nav-hamburger ${menuOpen ? "nav-hamburger-open" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ─────────────────────────────── */}
      <div className={`nav-mobile ${menuOpen ? "nav-mobile-open" : ""}`}>
        {/* Mobile Theme Toggle row */}
        <div className="nav-mobile-theme-row">
          <span className="nav-mobile-theme-text">Appearance</span>
          <button
            className="nav-mobile-theme-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
          >
            <span>{isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
          </button>
        </div>
        <div className="nav-mobile-divider" />

        {isLoggedIn ? (
          <>
            {/* User info strip */}
            <div className="nav-mobile-user">
              <div className="nav-mobile-avatar">{initials}</div>
              <div>
                <div className="nav-mobile-user-name">{user?.name}</div>
                <div className="nav-mobile-user-email">{user?.email}</div>
                {userLocation && (
                  <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    📍 {userLocation}
                  </div>
                )}
              </div>
            </div>
            <div className="nav-mobile-divider" />

            {AUTH_NAV_LINKS.map(({ to, label, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) =>
                  `nav-mobile-link ${isActive ? "nav-mobile-link-active" : ""}`
                }
                onClick={handleLinkClick}
              >
                {label}
              </NavLink>
            ))}

            <Link to="/report" className="nav-mobile-cta" onClick={handleLinkClick}>
              + Report Issue
            </Link>
            <div className="nav-mobile-divider" />
            <button className="nav-mobile-logout" onClick={handleLogout}>
              🚪 Sign Out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/" end className={({ isActive }) => `nav-mobile-link ${isActive ? "nav-mobile-link-active" : ""}`} onClick={handleLinkClick}>
              Home
            </NavLink>
            <div className="nav-mobile-auth">
              <Link to="/login" className="nav-mobile-login" onClick={handleLinkClick}>Log In</Link>
              <Link to="/register" className="nav-mobile-signup" onClick={handleLinkClick}>Sign Up</Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;