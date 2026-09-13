import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import complaintService from "../services/complaintService";
import { Badge, Spinner, Alert } from "../components/common";
import "./ComplaintDetails.css";

const STATUS_META = {
  resolved:      { label: "Resolved",     icon: "✅" },
  "in-progress": { label: "In Progress",  icon: "🔄" },
  pending:       { label: "Pending",      icon: "⏳" },
};

const PRIORITY_META = {
  high:   { label: "High Priority" },
  medium: { label: "Medium Priority" },
  low:    { label: "Low Priority" },
};

function formatDate(iso) {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    complaintService.getComplaintById(id)
      .then((data) => {
        if (isMounted) {
          setComplaint(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load complaint details");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="cd-wrapper">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "360px" }}>
          <Spinner size="lg" color="var(--pastel-accent)" />
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="cd-wrapper">
        <div className="cd-not-found">
          <div className="cd-nf-icon">🔎</div>
          <h2>Complaint Not Found</h2>
          <p>The complaint ID <strong>{id}</strong> does not exist or could not be loaded.</p>
          {error && <Alert type="error" message={error} style={{ maxWidth: "420px", margin: "16px auto" }} />}
          <Link to="/complaints" className="cd-back-btn">← Back to My Complaints</Link>
        </div>
      </div>
    );
  }

  const sm = STATUS_META[complaint.status] || { label: complaint.status, icon: "📋" };
  const pm = PRIORITY_META[complaint.priority] || { label: complaint.priority };

  return (
    <div className="cd-wrapper">
      <div className="cd-inner">

        {/* Breadcrumb */}
        <div className="cd-breadcrumb">
          <Link to="/complaints" className="cd-bread-link">My Complaints</Link>
          <span className="cd-bread-sep">›</span>
          <span className="cd-bread-current">{complaint.id}</span>
        </div>

        {/* ── Header Card ─────────────────────────────── */}
        <div className="cd-header-card">
          <div className={`cd-header-accent cd-accent-${complaint.status}`} />
          <div className="cd-header-body">
            <div className="cd-header-top">
              <div className="cd-header-meta">
                <span className="cd-cat-badge">{complaint.categoryIcon || "📋"} {complaint.category}</span>
                <span className="cd-id">{complaint.id}</span>
              </div>
              <div className="cd-header-badges">
                <Badge type="priority" variant={complaint.priority} label={pm.label} />
                <Badge type="status" variant={complaint.status} icon={sm.icon} label={sm.label} />
              </div>
            </div>
            <h1 className="cd-title">{complaint.title}</h1>
            <div className="cd-dates">
              <span>📅 Filed: <strong>{formatDate(complaint.date)}</strong></span>
              <span>🔁 Last Updated: <strong>{formatDate(complaint.updatedAt)}</strong></span>
            </div>
          </div>
        </div>

        {/* ── Two Column Layout ────────────────────────── */}
        <div className="cd-grid">

          {/* Left — details */}
          <div className="cd-left">

            {/* Description */}
            <div className="cd-section">
              <h2 className="cd-section-title">📝 Description</h2>
              <p className="cd-description">{complaint.description}</p>
            </div>

            {/* Location */}
            <div className="cd-section">
              <h2 className="cd-section-title">📍 Location Details</h2>
              <div className="cd-info-grid">
                <div className="cd-info-item">
                  <span className="cd-info-label">Address</span>
                  <span className="cd-info-val">{complaint.address || "Not specified"}</span>
                </div>
                <div className="cd-info-item">
                  <span className="cd-info-label">PIN Code</span>
                  <span className="cd-info-val">{complaint.pincode || "560001"}</span>
                </div>
              </div>
            </div>

            {/* Status info box */}
            <div className={`cd-status-box cd-sbox-${complaint.status}`}>
              <div className="cd-sbox-icon">{sm.icon}</div>
              <div>
                <div className="cd-sbox-label">Current Status</div>
                <div className="cd-sbox-val">{sm.label}</div>
                {complaint.status === "resolved" && (
                  <div className="cd-sbox-note">
                    This complaint has been successfully resolved. Thank you for helping improve your city!
                  </div>
                )}
                {complaint.status === "in-progress" && (
                  <div className="cd-sbox-note">
                    Your complaint is being actively worked on by the responsible department.
                  </div>
                )}
                {complaint.status === "pending" && (
                  <div className="cd-sbox-note">
                    Your complaint is in the queue and will be assigned to the relevant department shortly.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right — timeline */}
          <div className="cd-right">
            <div className="cd-section">
              <h2 className="cd-section-title">📌 Activity Timeline</h2>
              <div className="cd-timeline">
                {(complaint.timeline || []).map((t, i) => (
                  <div className="cd-tl-item" key={i}>
                    <div className="cd-tl-icon">{t.icon || "📋"}</div>
                    <div className="cd-tl-body">
                      <div className="cd-tl-event">{t.event}</div>
                      <div className="cd-tl-note">{t.note}</div>
                      <div className="cd-tl-date">{formatDate(t.date)}</div>
                    </div>
                    {i < (complaint.timeline?.length || 0) - 1 && <div className="cd-tl-line" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Back button */}
        <div className="cd-footer-actions">
          <Link to="/complaints" className="cd-back-btn">← Back to My Complaints</Link>
          {complaint.status === "pending" && (
            <button className="cd-withdraw-btn">Withdraw Complaint</button>
          )}
        </div>

      </div>
    </div>
  );
}

export default ComplaintDetails;