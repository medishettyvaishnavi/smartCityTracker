import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import complaintService from "../services/complaintService";
import adminService from "../services/adminService";
import { useAuth } from "../context/AuthContext";
import { Badge, Spinner, Alert } from "../components/common";
import "./ComplaintDetails.css";

const STATUS_META = {
  resolved:      { label: "Resolved",     icon: "✅" },
  "in-progress": { label: "In Progress",  icon: "🔄" },
  pending:       { label: "Pending",      icon: "⏳" },
  rejected:      { label: "Rejected",     icon: "❌" },
};

const PRIORITY_META = {
  high:   { label: "High Priority" },
  medium: { label: "Medium Priority" },
  low:    { label: "Low Priority" },
};

function formatDate(iso) {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [actionError, setActionError] = useState(null);

  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [assignSuccess, setAssignSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    complaintService
      .getComplaintById(id)
      .then((data) => {
        if (isMounted) {
          setComplaint(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          const message =
            err.response?.data?.message ||
            (err.request
              ? "Unable to connect to the server"
              : err.message || "Failed to load complaint details");
          setError(message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (user?.role === "admin") {
      adminService.getAdmins().then((data) => {
        setAdmins(data?.admins || (Array.isArray(data) ? data : []));
      }).catch(err => console.error("Failed to load admins", err));
    }
  }, [user]);

  const handleAssign = async () => {
    if (!selectedAdmin) return;
    setAssigning(true);
    setActionError(null);
    setAssignSuccess(false);
    try {
      await adminService.assignComplaint(id, selectedAdmin);
      const updatedComplaint = await complaintService.getComplaintById(id);
      setComplaint(updatedComplaint);
      setAssignSuccess(true);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.request ? "Unable to connect to the server" : err.message || "Failed to assign complaint.");
      setActionError(message);
    } finally {
      setAssigning(false);
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm("Are you sure you want to withdraw this complaint? This cannot be undone.")) {
      return;
    }

    setWithdrawing(true);
    setActionError(null);
    try {
      await complaintService.deleteComplaint(id);
      navigate("/complaints", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.request ? "Unable to connect to the server" : err.message || "Failed to withdraw complaint. Please try again.");
      setActionError(message);
      setWithdrawing(false);
    }
  };

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

        {actionError && (
          <Alert type="error" message={actionError} style={{ marginBottom: "16px" }} />
        )}

        {/* ── Header Card ─────────────────────────────── */}
        <div className="cd-header-card">
          <div className={`cd-header-accent cd-accent-${complaint.status}`} />
          <div className="cd-header-body">
            <div className="cd-header-top">
              <div className="cd-header-meta">
                <span className="cd-cat-badge">{complaint.categoryIcon || "📋"} {complaint.category}</span>
                <span className="cd-id">ID: {complaint.id}</span>
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

            {/* Attached Photos */}
            {complaint.images && complaint.images.length > 0 && (
              <div className="cd-section">
                <h2 className="cd-section-title">📷 Attached Photo Evidence</h2>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
                  {complaint.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      style={{
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid var(--border-color)",
                        maxHeight: "220px",
                      }}
                    >
                      <img
                        src={imgUrl}
                        alt={`Evidence ${idx + 1}`}
                        style={{
                          display: "block",
                          maxWidth: "100%",
                          maxHeight: "220px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="cd-section">
              <h2 className="cd-section-title">📍 Location Details</h2>
              <div className="cd-info-grid">
                <div className="cd-info-item">
                  <span className="cd-info-label">Address</span>
                  <span className="cd-info-val">{complaint.address || "Not specified"}</span>
                </div>
                {complaint.city && (
                  <div className="cd-info-item">
                    <span className="cd-info-label">City</span>
                    <span className="cd-info-val">{complaint.city}</span>
                  </div>
                )}
                {complaint.pincode && (
                  <div className="cd-info-item">
                    <span className="cd-info-label">PIN Code</span>
                    <span className="cd-info-val">{complaint.pincode}</span>
                  </div>
                )}
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
                    {complaint.adminNote
                      ? `Resolution Note: ${complaint.adminNote}`
                      : "This complaint has been successfully resolved. Thank you for helping improve your city!"}
                  </div>
                )}
                {complaint.status === "in-progress" && (
                  <div className="cd-sbox-note">
                    Your complaint is being actively worked on by the responsible municipal department.
                  </div>
                )}
                {complaint.status === "pending" && (
                  <div className="cd-sbox-note">
                    Your complaint is in the queue and will be assigned to the relevant department shortly.
                  </div>
                )}
                {complaint.status === "rejected" && (
                  <div className="cd-sbox-note">
                    {complaint.adminNote
                      ? `Reason: ${complaint.adminNote}`
                      : "This complaint could not be processed."}
                  </div>
                )}
              </div>
            </div>

            {/* Admin Assignment Block */}
            {user?.role === "admin" && (
              <div className="cd-section" style={{ marginTop: "24px" }}>
                <h2 className="cd-section-title">👥 Assign Complaint</h2>
                {assignSuccess && <Alert type="success" message="Complaint assigned successfully." style={{ marginBottom: "16px" }} />}
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <select 
                    className="cd-input" 
                    value={selectedAdmin || complaint?.assignedTo || ""}
                    onChange={(e) => setSelectedAdmin(e.target.value)}
                    style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
                  >
                    <option value="" disabled>Select an Admin</option>
                    {admins.map(a => (
                      <option key={a._id || a.id} value={a._id || a.id}>{a.name} ({a.email})</option>
                    ))}
                  </select>
                  <button 
                    className="cd-back-btn" 
                    onClick={handleAssign}
                    disabled={assigning || !selectedAdmin}
                    style={{ backgroundColor: "var(--primary-color)", color: "white", border: "none", cursor: "pointer" }}
                  >
                    {assigning ? <Spinner size="sm" color="white" /> : "Assign"}
                  </button>
                </div>
              </div>
            )}

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

        {/* Back button and Withdraw button */}
        <div className="cd-footer-actions">
          <Link to="/complaints" className="cd-back-btn">← Back to My Complaints</Link>
          {complaint.status === "pending" && (
            <button
              className="cd-withdraw-btn"
              onClick={handleWithdraw}
              disabled={withdrawing}
            >
              {withdrawing ? <Spinner size="sm" color="#ef4444" /> : "Withdraw Complaint"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default ComplaintDetails;