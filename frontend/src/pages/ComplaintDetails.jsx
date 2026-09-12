import { useParams, Link } from "react-router-dom";
import "./ComplaintDetails.css";

/* Shared mock data — in a real app this would be an API call */
const MOCK_COMPLAINTS = [
  {
    id: "SCT-100241",
    title: "Large pothole causing accidents on MG Road",
    category: "Roads", categoryIcon: "🛣️",
    status: "resolved", priority: "high",
    date: "2026-09-10", updatedAt: "2026-09-12",
    address: "MG Road, near Bus Stand, Ward 76",
    pincode: "560001",
    description: "A large pothole has formed in the middle of MG Road causing vehicle damage and significant traffic slowdowns. Multiple two-wheelers have had accidents due to this issue.",
    timeline: [
      { date: "2026-09-10", event: "Complaint filed", note: "Submitted by citizen.", icon: "📋" },
      { date: "2026-09-11", event: "Under Review", note: "Forwarded to Roads & Infrastructure dept.", icon: "🔍" },
      { date: "2026-09-11", event: "Work Order Raised", note: "Repair crew assigned.", icon: "🛠️" },
      { date: "2026-09-12", event: "Resolved", note: "Pothole patched and road resurfaced.", icon: "✅" },
    ],
  },
  {
    id: "SCT-100198",
    title: "Water pipeline burst leaking for 3 days",
    category: "Water", categoryIcon: "💧",
    status: "in-progress", priority: "high",
    date: "2026-09-08", updatedAt: "2026-09-11",
    address: "Residency Road, Ward 22",
    pincode: "560025",
    description: "Underground pipeline has burst and water has been leaking continuously for 3 days. This is resulting in severe water loss and the road surface is becoming waterlogged.",
    timeline: [
      { date: "2026-09-08", event: "Complaint filed", note: "Submitted by citizen.", icon: "📋" },
      { date: "2026-09-09", event: "Under Review", note: "BWSSB notified.", icon: "🔍" },
      { date: "2026-09-11", event: "In Progress", note: "Repair crew dispatched to site.", icon: "🔧" },
    ],
  },
  {
    id: "SCT-100174",
    title: "Street lights not working for 2 weeks",
    category: "Electricity", categoryIcon: "⚡",
    status: "pending", priority: "medium",
    date: "2026-09-05", updatedAt: "2026-09-05",
    address: "100 Feet Road, Indiranagar, Ward 45",
    pincode: "560038",
    description: "Six consecutive street lights have been non-functional for two weeks, making the stretch extremely unsafe at night for pedestrians and motorists alike.",
    timeline: [
      { date: "2026-09-05", event: "Complaint filed", note: "Submitted by citizen.", icon: "📋" },
    ],
  },
  {
    id: "SCT-100155",
    title: "Garbage not collected for over a week",
    category: "Sanitation", categoryIcon: "🗑️",
    status: "resolved", priority: "medium",
    date: "2026-09-02", updatedAt: "2026-09-09",
    address: "Koramangala 5th Block, Ward 11",
    pincode: "560095",
    description: "Municipal garbage truck has not visited the area for 8 days causing garbage bins to overflow onto the footpath creating health hazards.",
    timeline: [
      { date: "2026-09-02", event: "Complaint filed", note: "Submitted by citizen.", icon: "📋" },
      { date: "2026-09-04", event: "Under Review", note: "BBMP Sanitation dept. alerted.", icon: "🔍" },
      { date: "2026-09-09", event: "Resolved", note: "Garbage cleared and schedule regularised.", icon: "✅" },
    ],
  },
  {
    id: "SCT-100132",
    title: "Signal at junction non-functional",
    category: "Traffic", categoryIcon: "🚦",
    status: "in-progress", priority: "high",
    date: "2026-08-30", updatedAt: "2026-09-07",
    address: "Silk Board Junction, Ward 63",
    pincode: "560068",
    description: "Traffic signal has been non-functional since Monday causing massive congestion during peak hours. Police deployment is inadequate.",
    timeline: [
      { date: "2026-08-30", event: "Complaint filed", note: "Submitted by citizen.", icon: "📋" },
      { date: "2026-09-01", event: "Under Review", note: "Traffic police & BBMP notified.", icon: "🔍" },
      { date: "2026-09-07", event: "In Progress", note: "Technician visit scheduled.", icon: "🔧" },
    ],
  },
  {
    id: "SCT-100109",
    title: "Sewage overflowing into street",
    category: "Drainage", categoryIcon: "🌊",
    status: "pending", priority: "high",
    date: "2026-08-27", updatedAt: "2026-08-27",
    address: "BTM Layout, Ward 38",
    pincode: "560076",
    description: "Blocked drainage is causing raw sewage to overflow onto the pedestrian walkway creating an unsanitary and hazardous environment.",
    timeline: [
      { date: "2026-08-27", event: "Complaint filed", note: "Submitted by citizen.", icon: "📋" },
    ],
  },
  {
    id: "SCT-100088",
    title: "Park benches vandalized and broken",
    category: "Parks", categoryIcon: "🌳",
    status: "pending", priority: "low",
    date: "2026-08-22", updatedAt: "2026-08-22",
    address: "Cubbon Park East Gate, Ward 55",
    pincode: "560001",
    description: "Multiple park benches have been vandalized and present a safety hazard. Broken metal edges could cause injuries to visitors.",
    timeline: [
      { date: "2026-08-22", event: "Complaint filed", note: "Submitted by citizen.", icon: "📋" },
    ],
  },
];

const STATUS_META = {
  resolved:      { label: "Resolved",     cls: "cd-badge-resolved",  icon: "✅" },
  "in-progress": { label: "In Progress",  cls: "cd-badge-progress",  icon: "🔄" },
  pending:       { label: "Pending",      cls: "cd-badge-pending",   icon: "⏳" },
};

const PRIORITY_META = {
  high:   { label: "High Priority",   cls: "cd-pri-high" },
  medium: { label: "Medium Priority", cls: "cd-pri-medium" },
  low:    { label: "Low Priority",    cls: "cd-pri-low" },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function ComplaintDetails() {
  const { id } = useParams();
  const complaint = MOCK_COMPLAINTS.find((c) => c.id === id);

  if (!complaint) {
    return (
      <div className="cd-wrapper">
        <div className="cd-not-found">
          <div className="cd-nf-icon">🔎</div>
          <h2>Complaint Not Found</h2>
          <p>The complaint ID <strong>{id}</strong> does not exist.</p>
          <Link to="/complaints" className="cd-back-btn">← Back to My Complaints</Link>
        </div>
      </div>
    );
  }

  const sm = STATUS_META[complaint.status];
  const pm = PRIORITY_META[complaint.priority];

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
                <span className="cd-cat-badge">{complaint.categoryIcon} {complaint.category}</span>
                <span className="cd-id">{complaint.id}</span>
              </div>
              <div className="cd-header-badges">
                <span className={`cd-priority-badge ${pm.cls}`}>{pm.label}</span>
                <span className={`cd-status-badge ${sm.cls}`}>{sm.icon} {sm.label}</span>
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
                  <span className="cd-info-val">{complaint.address}</span>
                </div>
                <div className="cd-info-item">
                  <span className="cd-info-label">PIN Code</span>
                  <span className="cd-info-val">{complaint.pincode}</span>
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
                {complaint.timeline.map((t, i) => (
                  <div className="cd-tl-item" key={i}>
                    <div className="cd-tl-icon">{t.icon}</div>
                    <div className="cd-tl-body">
                      <div className="cd-tl-event">{t.event}</div>
                      <div className="cd-tl-note">{t.note}</div>
                      <div className="cd-tl-date">{formatDate(t.date)}</div>
                    </div>
                    {i < complaint.timeline.length - 1 && <div className="cd-tl-line" />}
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