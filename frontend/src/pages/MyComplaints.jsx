import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import complaintService from "../services/complaintService";
import { Badge, Spinner } from "../components/common";
import "./MyComplaints.css";

const STATUS_META = {
  resolved:      { label: "Resolved",     icon: "✅" },
  "in-progress": { label: "In Progress",  icon: "🔄" },
  pending:       { label: "Pending",      icon: "⏳" },
};

const PRIORITY_META = {
  high:   { label: "High" },
  medium: { label: "Medium" },
  low:    { label: "Low" },
};

function formatDate(iso) {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function MyComplaints() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  // Load complaints and stats via complaintService
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [list, statistics] = await Promise.all([
        complaintService.getComplaints({ status: activeTab, search, sortBy }),
        complaintService.getComplaintStats(),
      ]);
      setComplaints(list);
      setStats(statistics);
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, sortBy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const tabs = [
    { key: "all",         label: "All",         count: stats.total },
    { key: "pending",     label: "Pending",     count: stats.pending },
    { key: "in-progress", label: "In Progress", count: stats.inProgress },
    { key: "resolved",    label: "Resolved",    count: stats.resolved },
  ];

  return (
    <div className="mc-wrapper">
      {/* ── Page Header ─────────────────────────────── */}
      <div className="mc-page-header">
        <div className="mc-page-header-inner">
          <div>
            <span className="mc-badge">Citizen Portal</span>
            <h1 className="mc-title">My Complaints</h1>
            <p className="mc-subtitle">
              Track the status of your reported issues in real-time.
            </p>
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
            <span className="mc-sum-val">{stats.total}</span>
            <span className="mc-sum-lbl">Total Filed</span>
          </div>
          <div className="mc-summary-card mc-sum-progress">
            <span className="mc-sum-icon">🔄</span>
            <span className="mc-sum-val">{stats.inProgress}</span>
            <span className="mc-sum-lbl">In Progress</span>
          </div>
          <div className="mc-summary-card mc-sum-resolved">
            <span className="mc-sum-icon">✅</span>
            <span className="mc-sum-val">{stats.resolved}</span>
            <span className="mc-sum-lbl">Resolved</span>
          </div>
          <div className="mc-summary-card mc-sum-pending">
            <span className="mc-sum-icon">⏳</span>
            <span className="mc-sum-val">{stats.pending}</span>
            <span className="mc-sum-lbl">Pending</span>
          </div>
        </div>

        {/* ── Controls ────────────────────────────────── */}
        <div className="mc-controls">
          {/* Tab filters */}
          <div className="mc-tabs">
            {tabs.map((t) => (
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
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0" }}>
            <Spinner size="lg" color="var(--pastel-accent)" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="mc-empty">
            <div className="mc-empty-icon">🔎</div>
            <div className="mc-empty-title">No complaints found</div>
            <div className="mc-empty-sub">Try adjusting your search or filter.</div>
          </div>
        ) : (
          <div className="mc-list">
            {complaints.map((c) => {
              const sm = STATUS_META[c.status] || { label: c.status, icon: "📋" };
              const pm = PRIORITY_META[c.priority] || { label: c.priority };
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
                        <Badge type="priority" variant={c.priority} label={pm.label} />
                        <Badge type="status" variant={c.status} icon={sm.icon} label={sm.label} />
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