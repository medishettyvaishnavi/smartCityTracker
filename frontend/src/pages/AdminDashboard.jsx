import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Spinner } from "../components/common";
import adminService from "../services/adminService";
import "./AdminDashboard.css";

const STATUS_META = {
  pending: { label: "Pending", icon: "⏳" },
  "in-progress": { label: "In progress", icon: "🔄" },
  resolved: { label: "Resolved", icon: "✅" },
  rejected: { label: "Rejected", icon: "⛔" },
};

const CATEGORIES = [
  "Roads & Infrastructure",
  "Water Supply",
  "Electricity",
  "Sanitation & Garbage",
  "Public Safety",
  "Parks & Recreation",
  "Noise Pollution",
  "Other",
];

const PRIORITIES = ["low", "medium", "high"];

const getId = (value) => value?._id || value?.id || value;

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [complaintData, statData, adminData] = await Promise.all([
        adminService.getComplaints({ status, category, priority, search }),
        adminService.getStats(),
        adminService.getAdmins(),
      ]);
      setComplaints(complaintData?.complaints || []);
      setStats(statData || {});
      setAdmins(adminData?.admins || []);
    } catch (err) {
      setError(err.message || "Could not load the admin workspace.");
    } finally {
      setLoading(false);
    }
  }, [category, priority, search, status]);

  useEffect(() => {
    queueMicrotask(loadData);
  }, [loadData]);

  const updateStatus = async (complaint, nextStatus) => {
    const id = getId(complaint);
    setSavingId(id);
    try {
      const result = await adminService.updateComplaintStatus(id, nextStatus);
      setComplaints((current) => current.map((item) => getId(item) === id ? result.complaint : item));
      const refreshedStats = await adminService.getStats();
      setStats(refreshedStats || {});
    } catch (err) {
      setError(err.message || "Could not update the complaint.");
    } finally {
      setSavingId("");
    }
  };

  const assignComplaint = async (complaint, adminId) => {
    const id = getId(complaint);
    setSavingId(id);
    try {
      const result = await adminService.assignComplaint(id, adminId || null);
      setComplaints((current) => current.map((item) => getId(item) === id ? result.complaint : item));
    } catch (err) {
      setError(err.message || "Could not assign the complaint.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">Operations workspace</span>
          <h1>Complaint control room</h1>
          <p>Review incoming reports, assign ownership, and keep residents informed.</p>
        </div>
        <button className="admin-refresh" type="button" onClick={loadData} disabled={loading}>↻ Refresh</button>
      </header>

      <section className="admin-stats" aria-label="Complaint statistics">
        <div><strong>{stats.total || 0}</strong><span>Total reports</span></div>
        <div><strong>{stats.pending || 0}</strong><span>Pending</span></div>
        <div><strong>{stats.inProgress || 0}</strong><span>In progress</span></div>
        <div><strong>{stats.resolved || 0}</strong><span>Resolved</span></div>
      </section>

      {error && <Alert type="error" message={error} onClose={() => setError("")} />}

      <section className="admin-toolbar">
        <div className="admin-tabs" role="tablist" aria-label="Filter complaints">
          {["all", "pending", "in-progress", "resolved", "rejected"].map((item) => (
            <button key={item} type="button" className={status === item ? "active" : ""} onClick={() => setStatus(item)}>
              {item === "all" ? "All" : STATUS_META[item].label}
            </button>
          ))}
        </div>
        <input aria-label="Search complaints" type="search" placeholder="Search title or address" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All categories</option>
          {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select aria-label="Filter by priority" value={priority} onChange={(event) => setPriority(event.target.value)}>
          <option value="all">All priorities</option>
          {PRIORITIES.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}
        </select>
      </section>

      {loading ? <div className="admin-loading"><Spinner size="lg" color="var(--pastel-accent)" /></div> : complaints.length === 0 ? (
        <div className="admin-empty">No complaints match this filter.</div>
      ) : (
        <section className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Complaint</th><th>Reporter</th><th>Status</th><th>Owner</th><th>Update</th></tr></thead>
            <tbody>
              {complaints.map((complaint) => {
                const id = getId(complaint);
                const meta = STATUS_META[complaint.status] || STATUS_META.pending;
                return (
                  <tr key={id}>
                    <td><strong>{complaint.title}</strong><small>{complaint.category} · {complaint.location?.address || "No address"}</small></td>
                    <td>{complaint.user?.name || "Unknown"}<small>{complaint.user?.email || ""}</small></td>
                    <td><Badge type="status" variant={complaint.status} icon={meta.icon} label={meta.label} /></td>
                    <td><select value={getId(complaint.assignedTo) || ""} onChange={(event) => assignComplaint(complaint, event.target.value)} disabled={savingId === id} aria-label={`Assign ${complaint.title}`}><option value="">Unassigned</option>{admins.map((admin) => <option key={getId(admin)} value={getId(admin)}>{admin.name}</option>)}</select></td>
                    <td><select value={complaint.status} onChange={(event) => updateStatus(complaint, event.target.value)} disabled={savingId === id} aria-label={`Update status for ${complaint.title}`}>{Object.entries(STATUS_META).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}</select></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}

export default AdminDashboard;
