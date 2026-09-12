import { useState } from "react";
import { Link } from "react-router-dom";
import "./MyComplaints.css";

/* ── Mock data ──────────────────────────────────────── */
const MOCK_COMPLAINTS = [
  {
    id: "SCT-100241",
    title: "Large pothole causing accidents on MG Road",
    category: "Roads",
    categoryIcon: "🛣️",
    status: "resolved",
    priority: "high",
    date: "2026-09-10",
    address: "MG Road, near Bus Stand, Ward 76",
    description: "A large pothole has formed in the middle of MG Road causing vehicle damage and traffic slowdowns.",
    updatedAt: "2026-09-12",
  },
  {
    id: "SCT-100198",
    title: "Water pipeline burst leaking for 3 days",
    category: "Water",
    categoryIcon: "💧",
    status: "in-progress",
    priority: "high",
    date: "2026-09-08",
    address: "Residency Road, Ward 22",
    description: "Underground pipeline has burst and water has been leaking continuously for 3 days.",
    updatedAt: "2026-09-11",
  },
  {
    id: "SCT-100174",
    title: "Street lights not working for 2 weeks",
    category: "Electricity",
    categoryIcon: "⚡",
    status: "pending",
    priority: "medium",
    date: "2026-09-05",
    address: "100 Feet Road, Indiranagar, Ward 45",
    description: "Six consecutive street lights have been non-functional, making the street unsafe at night.",
    updatedAt: "2026-09-05",
  },
  {
    id: "SCT-100155",
    title: "Garbage not collected for over a week",
    category: "Sanitation",
    categoryIcon: "🗑️",
    status: "resolved",
    priority: "medium",
    date: "2026-09-02",
    address: "Koramangala 5th Block, Ward 11",
    description: "Municipal garbage truck has not visited the area for 8 days causing overflow.",
    updatedAt: "2026-09-09",
  },
  {
    id: "SCT-100132",
    title: "Signal at junction non-functional",
    category: "Traffic",
    categoryIcon: "🚦",
    status: "in-progress",
    priority: "high",
    date: "2026-08-30",
    address: "Silk Board Junction, Ward 63",
    description: "Traffic signal has been non-functional since Monday causing massive congestion.",
    updatedAt: "2026-09-07",
  },
  {
    id: "SCT-100109",
    title: "Sewage overflowing into street",
    category: "Drainage",
    categoryIcon: "🌊",
    status: "pending",
    priority: "high",
    date: "2026-08-27",
    address: "BTM Layout, Ward 38",
    description: "Blocked drainage is causing raw sewage to overflow onto the pedestrian walkway.",
    updatedAt: "2026-08-27",
  },
  {
    id: "SCT-100088",
    title: "Park benches vandalized and broken",
    category: "Parks",
    categoryIcon: "🌳",
    status: "pending",
    priority: "low",
    date: "2026-08-22",
    address: "Cubbon Park East Gate, Ward 55",
    description: "Multiple park benches have been vandalized and present a safety hazard.",
    updatedAt: "2026-08-22",
  },
];

const TABS = [
  { key: "all",         label: "All",         count: MOCK_COMPLAINTS.length },
  { key: "pending",     label: "Pending",     count: MOCK_COMPLAINTS.filter(c => c.status === "pending").length },
  { key: "in-progress", label: "In Progress", count: MOCK_COMPLAINTS.filter(c => c.status === "in-progress").length },
  { key: "resolved",    label: "Resolved",    count: MOCK_COMPLAINTS.filter(c => c.status === "resolved").length },
];

const STATUS_META = {
  resolved:      { label: "Resolved",     cls: "badge-resolved",  icon: "✅" },
  "in-progress": { label: "In Progress",  cls: "badge-progress",  icon: "🔄" },
  pending:       { label: "Pending",      cls: "badge-pending",   icon: "⏳" },
};

const PRIORITY_META = {
  high:   { label: "High",   cls: "pri-high" },
  medium: { label: "Medium", cls: "pri-medium" },
  low:    { label: "Low",    cls: "pri-low" },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function MyComplaints() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filtered = MOCK_COMPLAINTS
    .filter((c) => activeTab === "all" || c.status === activeTab)
    .filter((c) =>
      search === "" ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.date) - new Date(a.date);
      if (sortBy === "oldest") return new Date(a.date) - new Date(b.date);
      if (sortBy === "priority") {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      }
      return 0;
    });

  return (
    <div className="mc-wrapper">
      {/* ── Page Header ─────────────────────────────── */}
      <div className="mc-page-header">
        <div className="mc-page-header-inner">
          <div>
            <h1 className="mc-page-title">My Complaints</h1>
            <p className="mc-page-sub">Track all your reported issues in one place.</p>
          </div>
          <Link to="/report" className="mc-report-btn">
            + New Complaint
          </Link>
        </div>
      </div>

      <div className="mc-body">

        {/* ── Summary Cards ───────────────────────────── */}
        <div className="mc-summary">
          <div className="mc-summary-card mc-sum-total">
            <span className="mc-sum-icon">📋</span>
            <span className="mc-sum-val">{MOCK_COMPLAINTS.length}</span>
            <span className="mc-sum-lbl">Total Filed</span>
          </div>
          <div className="mc-summary-card mc-sum-progress">
            <span className="mc-sum-icon">🔄</span>
            <span className="mc-sum-val">{MOCK_COMPLAINTS.filter(c=>c.status==="in-progress").length}</span>
            <span className="mc-sum-lbl">In Progress</span>
          </div>
          <div className="mc-summary-card mc-sum-resolved">
            <span className="mc-sum-icon">✅</span>
            <span className="mc-sum-val">{MOCK_COMPLAINTS.filter(c=>c.status==="resolved").length}</span>
            <span className="mc-sum-lbl">Resolved</span>
          </div>
          <div className="mc-summary-card mc-sum-pending">
            <span className="mc-sum-icon">⏳</span>
            <span className="mc-sum-val">{MOCK_COMPLAINTS.filter(c=>c.status==="pending").length}</span>
            <span className="mc-sum-lbl">Pending</span>
          </div>
        </div>

        {/* ── Controls ────────────────────────────────── */}
        <div className="mc-controls">
          {/* Tab filters */}
          <div className="mc-tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`mc-tab ${activeTab === t.key ? "mc-tab-active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
                <span className="mc-tab-count">{t.count}</span>
              </button>
            ))}
          </div>

          {/* Search + sort */}
          <div className="mc-search-row">
            <div className="mc-search-wrap">
              <span className="mc-search-icon">🔍</span>
              <input
                className="mc-search"
                type="search"
                placeholder="Search by title, category, ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="mc-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">By Priority</option>
            </select>
          </div>
        </div>

        {/* ── List ────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="mc-empty">
            <div className="mc-empty-icon">🔎</div>
            <div className="mc-empty-title">No complaints found</div>
            <div className="mc-empty-sub">Try adjusting your search or filter.</div>
          </div>
        ) : (
          <div className="mc-list">
            {filtered.map((c) => {
              const sm = STATUS_META[c.status];
              const pm = PRIORITY_META[c.priority];
              return (
                <Link to={`/complaints/${c.id}`} className="mc-card" key={c.id}>
                  {/* Left accent */}
                  <div className={`mc-card-accent mc-accent-${c.status}`} />

                  <div className="mc-card-body">
                    {/* Top row */}
                    <div className="mc-card-top">
                      <div className="mc-card-meta">
                        <span className="mc-cat-badge">
                          {c.categoryIcon} {c.category}
                        </span>
                        <span className="mc-id">{c.id}</span>
                      </div>
                      <div className="mc-card-badges">
                        <span className={`mc-priority ${pm.cls}`}>{pm.label}</span>
                        <span className={`mc-status ${sm.cls}`}>
                          {sm.icon} {sm.label}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="mc-card-title">{c.title}</h3>

                    {/* Description */}
                    <p className="mc-card-desc">{c.description}</p>

                    {/* Bottom row */}
                    <div className="mc-card-footer">
                      <span className="mc-footer-item">
                        📍 {c.address}
                      </span>
                      <div className="mc-footer-right">
                        <span className="mc-footer-item">
                          📅 Filed: {formatDate(c.date)}
                        </span>
                        <span className="mc-footer-item mc-updated">
                          🔁 Updated: {formatDate(c.updatedAt)}
                        </span>
                        <span className="mc-view-link">View Details →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default MyComplaints;