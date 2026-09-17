import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import WeatherCard from "../components/WeatherCard";
import "./Home.css";

const STATS = [
  { value: "4,820+", label: "Issues Reported", icon: "📢" },
  { value: "3,210+", label: "Resolved", icon: "✅" },
  { value: "98", label: "Wards Covered", icon: "🗺️" },
  { value: "12 hrs", label: "Avg. Response Time", icon: "⚡" },
];

const FEATURES = [
  {
    icon: "🛣️",
    title: "Report City Issues",
    desc: "Instantly report potholes, broken streetlights, water leaks, garbage overflow, and more with photo evidence.",
  },
  {
    icon: "📍",
    title: "Track in Real-Time",
    desc: "Follow your complaint's progress — from submission to in-review to resolved — with live status updates.",
  },
  {
    icon: "🏛️",
    title: "Direct to Authorities",
    desc: "Complaints are routed directly to the responsible city department, cutting red tape and delays.",
  },
  {
    icon: "📊",
    title: "City Analytics",
    desc: "View ward-level heatmaps and category-wise breakdowns to understand your city's service gaps.",
  },
  {
    icon: "🔔",
    title: "Smart Notifications",
    desc: "Get notified the moment there's an update on any of your reported issues via email or in-app.",
  },
  {
    icon: "🤝",
    title: "Community Driven",
    desc: "Upvote issues raised by your neighbours to fast-track resolution of widespread problems.",
  },
];

const STEPS = [
  { num: "01", title: "Create an Account", desc: "Sign up in seconds — no paperwork, no queues." },
  { num: "02", title: "Report the Issue", desc: "Fill a quick form, pick a category, and attach a photo." },
  { num: "03", title: "We Route It", desc: "Your complaint is automatically sent to the right department." },
  { num: "04", title: "Track & Done", desc: "Follow progress live and receive a resolution notification." },
];

const RECENT = [
  { category: "Roads", title: "Pothole on Brigade Road", status: "resolved", time: "2h ago", ward: "Ward 76" },
  { category: "Water", title: "Pipeline burst near MG Road", status: "in-progress", time: "5h ago", ward: "Ward 22" },
  { category: "Electricity", title: "Street light out for 3 days", status: "pending", time: "1d ago", ward: "Ward 45" },
  { category: "Sanitation", title: "Overflowing garbage bin", status: "resolved", time: "1d ago", ward: "Ward 11" },
  { category: "Traffic", title: "Signal not working at junction", status: "in-progress", time: "2d ago", ward: "Ward 63" },
];

const STATUS_META = {
  resolved: { label: "Resolved", cls: "status-resolved" },
  "in-progress": { label: "In Progress", cls: "status-progress" },
  pending: { label: "Pending", cls: "status-pending" },
};

function Home() {
  const { isLoggedIn, user } = useAuth();
  return (
    <div className="home-root">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg-glow" />
        <div className="hero-content">
          <span className="hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 21h18M5 21V7l5-3v17M10 21V11l5-2v12M15 21V4l5 2v15" />
            </svg>
            Smart City Initiative
          </span>
          <h1 className="hero-title">
            Your City,
            <span className="hero-title-accent">Your Voice.</span>
          </h1>
          <p className="hero-desc">
            Report public issues, track resolutions in real-time, and help
            authorities build a better city-all in one place.
          </p>
          <div className="hero-actions">
            {isLoggedIn ? (
              <>
                <Link to="/report" className="hero-btn-primary">
                  📢 Report an Issue
                </Link>
                <Link to="/complaints" className="hero-btn-ghost">
                  My Complaints →
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="hero-btn-primary">
                  Sign In to Get Started
                </Link>
                <Link to="/register" className="hero-btn-ghost">
                  Create Free Account →
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Floating cards visual */}
        <div className="hero-visual">
          <div className="hv-card hv-card-1">
            <span className="hv-icon">🛣️</span>
            <span>Road Damaged</span>
            <span className="hv-tag hv-tag-red">Pending</span>
          </div>
          <div className="hv-card hv-card-2">
            <span className="hv-icon">💧</span>
            <span>Water Leak</span>
            <span className="hv-tag hv-tag-blue">In Progress</span>
          </div>
          <div className="hv-card hv-card-3">
            <span className="hv-icon">💡</span>
            <span>Street Light</span>
            <span className="hv-tag hv-tag-green">Resolved ✓</span>
          </div>
        </div>
      </section>

      {/* ── Auth Prompt / Welcome Banner ─────────────── */}
      {isLoggedIn ? (
        <section className="welcome-banner">
          <div className="welcome-inner">
            <div className="welcome-left">
              <div className="welcome-avatar">{user?.initials}</div>
              <div>
                <p className="welcome-title">Welcome back, {user?.name?.split(" ")[0]}! 👋</p>
                <p className="welcome-sub">You're signed in as {user?.email}</p>
              </div>
            </div>
            <div className="welcome-actions">
              <Link to="/report" className="auth-register-btn">📢 Report an Issue</Link>
              <Link to="/complaints" className="auth-login-btn">My Complaints</Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="auth-prompt">
          <div className="auth-prompt-inner">
            <div className="auth-prompt-left">
              <span className="auth-prompt-icon">🔐</span>
              <div>
                <p className="auth-prompt-title">Don't have an account yet?</p>
                <p className="auth-prompt-sub">Register for free to report issues and track resolutions.</p>
              </div>
            </div>
            <div className="auth-prompt-actions">
              <Link to="/login" className="auth-login-btn">Log In</Link>
              <span className="auth-prompt-divider">or</span>
              <Link to="/register" className="auth-register-btn">
                Create Free Account →
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-inner">
          <WeatherCard city="Hyderabad" />
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────── */}
      <section className="stats-bar">
        {STATS.map((s) => (
          <div className="stat-item" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-sub">
              A complete platform for citizens to report, track, and resolve city issues.
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works + Recent ─────────────────────── */}
      <section className="section section-alt">
        <div className="section-inner two-col">

          {/* How it works */}
          <div>
            <h2 className="section-title">How It Works</h2>
            <p className="section-sub" style={{ marginBottom: "2rem" }}>
              Four simple steps to get your issue resolved.
            </p>
            <div className="steps">
              {STEPS.map((s, i) => (
                <div className="step" key={s.num}>
                  <div className="step-num">{s.num}</div>
                  <div className="step-body">
                    <div className="step-title">{s.title}</div>
                    <div className="step-desc">{s.desc}</div>
                  </div>
                  {i < STEPS.length - 1 && <div className="step-line" />}
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <h2 className="section-title">Recent Activity</h2>
            <p className="section-sub" style={{ marginBottom: "2rem" }}>
              Latest complaints from across your city.
            </p>
            <div className="activity-list">
              {RECENT.map((r, i) => {
                const meta = STATUS_META[r.status];
                return (
                  <div className="activity-item" key={i}>
                    <div className="activity-left">
                      <span className="activity-category">{r.category}</span>
                      <span className="activity-title">{r.title}</span>
                      <span className="activity-meta">{r.ward} · {r.time}</span>
                    </div>
                    <span className={`activity-status ${meta.cls}`}>{meta.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────── */}
      <section className="cta-banner">
        <div className="cta-glow" />
        <h2 className="cta-title">Spotted a problem in your city?</h2>
        <p className="cta-sub">It takes less than 2 minutes to file a complaint.</p>
        <Link to="/report" className="hero-btn-primary">
          Get Started →
        </Link>
      </section>

    </div>
  );
}

export default Home;