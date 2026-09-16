import api from "./api";
import { API_ENDPOINTS } from "./apiContracts";
import { getStoredComplaints, saveComplaintToStore } from "./mockData";

export const CATEGORY_ICONS = {
  "Roads & Infrastructure": "🛣️",
  "Water Supply": "💧",
  "Electricity": "⚡",
  "Sanitation & Garbage": "🗑️",
  "Public Safety": "🛡️",
  "Parks & Recreation": "🌳",
  "Noise Pollution": "🔊",
  "Other": "📋",
  roads: "🛣️",
  water: "💧",
  electricity: "⚡",
  sanitation: "🗑️",
  streetlights: "💡",
  parks: "🌳",
  drainage: "🌊",
  noise: "🔊",
  traffic: "🚦",
  other: "📋",
};

/**
 * Map raw MongoDB complaint document to the flat, rich shape expected by the UI.
 */
export function normalizeComplaint(c) {
  if (!c) return null;

  const rawId = c._id ?? c.id;
  const id = rawId ? rawId.toString() : "";
  const address =
    c.location?.address && c.location?.city
      ? `${c.location.address}, ${c.location.city}`
      : c.location?.address ?? c.location?.city ?? c.address ?? "Location not specified";

  const status = c.status || "pending";
  const category = c.category || "Other";
  const icon = c.categoryIcon || CATEGORY_ICONS[category] || "📋";

  const defaultTimeline = [
    {
      date: c.createdAt || c.date || new Date().toISOString(),
      event: "Complaint Filed",
      note: `Submitted under ${category}.`,
      icon: "📋",
    },
    ...(status === "in-progress" || status === "resolved"
      ? [
          {
            date: c.updatedAt || c.createdAt || new Date().toISOString(),
            event: "Assigned & In Progress",
            note: "Department is actively addressing this issue.",
            icon: "🔄",
          },
        ]
      : []),
    ...(status === "resolved"
      ? [
          {
            date: c.updatedAt || new Date().toISOString(),
            event: "Resolved",
            note: c.adminNote || "The reported issue has been verified and resolved.",
            icon: "✅",
          },
        ]
      : []),
  ];

  return {
    ...c,
    id,
    _id: id,
    title: c.title || "Untitled Complaint",
    description: c.description || "",
    date: c.createdAt ?? c.date ?? new Date().toISOString(),
    updatedAt: c.updatedAt ?? c.createdAt ?? c.date ?? new Date().toISOString(),
    address,
    city: c.location?.city || "",
    pincode: c.pincode || "",
    category,
    categoryIcon: icon,
    priority: c.priority || "medium",
    status,
    images: Array.isArray(c.images) ? c.images : [],
    timeline: Array.isArray(c.timeline) && c.timeline.length > 0 ? c.timeline : defaultTimeline,
  };
}

/**
 * Map a list of raw complaints
 */
export function normalizeComplaints(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeComplaint).filter(Boolean);
}

export const complaintService = {
  /**
   * Fetch all complaints with optional filtering, search, and sorting
   *
   * @param {Object} [params]
   * @param {'all'|'pending'|'in-progress'|'resolved'} [params.status]
   * @param {string} [params.search]
   * @param {'newest'|'oldest'|'priority'} [params.sortBy]
   */
  async getComplaints(params = {}) {
    const { status = "all", search = "", sortBy = "newest" } = params;

    try {
      const response = await api.get(API_ENDPOINTS.COMPLAINTS.LIST, {
        params: {
          ...(status && status !== "all" ? { status } : {}),
          ...(search && search.trim() ? { search: search.trim() } : {}),
          ...(sortBy ? { sortBy } : {}),
        },
      });

      // Backend returns: { count, complaints: [...] }
      const raw = response.data?.complaints ?? response.data?.data ?? response.data;
      const list = Array.isArray(raw) ? raw : [];

      return normalizeComplaints(list);
    } catch (err) {
      console.warn("Backend complaints request failed, falling back to mock storage:", err.message);

      // Fallback to local mock data if offline or network error
      await new Promise((r) => setTimeout(r, 200));
      let list = [...getStoredComplaints()];

      if (status && status !== "all") {
        list = list.filter((c) => c.status === status);
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter(
          (c) =>
            c.title?.toLowerCase().includes(q) ||
            c.category?.toLowerCase().includes(q) ||
            c.id?.toLowerCase().includes(q) ||
            c.address?.toLowerCase().includes(q)
        );
      }

      if (sortBy === "newest") {
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (sortBy === "oldest") {
        list.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (sortBy === "priority") {
        const order = { high: 0, medium: 1, low: 2 };
        list.sort((a, b) => (order[a.priority] ?? 1) - (order[b.priority] ?? 1));
      }

      return normalizeComplaints(list);
    }
  },

  /**
   * Fetch a single complaint by ID
   */
  async getComplaintById(id) {
    try {
      const response = await api.get(API_ENDPOINTS.COMPLAINTS.GET_BY_ID(id));
      const raw = response.data?.complaint ?? response.data?.data ?? response.data;
      if (!raw) {
        throw new Error(`Complaint with ID ${id} was not found.`);
      }
      return normalizeComplaint(raw);
    } catch (err) {
      console.warn("Backend getComplaintById failed, checking mock store:", err.message);
      const list = getStoredComplaints();
      const complaint = list.find((c) => c.id === id || c._id === id);
      if (complaint) {
        return normalizeComplaint(complaint);
      }
      throw err;
    }
  },

  /**
   * Create and submit a new complaint to the backend
   */
  async createComplaint(complaintData) {
    const payload = {
      title: complaintData.title,
      description: complaintData.description,
      category: complaintData.category,
      priority: complaintData.priority || "medium",
      location: {
        address: complaintData.address || "",
        city: complaintData.city || (complaintData.pincode ? `PIN ${complaintData.pincode}` : ""),
      },
      images: Array.isArray(complaintData.images)
        ? complaintData.images
        : complaintData.imagePreview
        ? [complaintData.imagePreview]
        : [],
    };

    try {
      const response = await api.post(API_ENDPOINTS.COMPLAINTS.CREATE, payload);
      const raw = response.data?.complaint ?? response.data?.data ?? response.data;
      return normalizeComplaint(raw);
    } catch (err) {
      console.error("Failed to create complaint on backend:", err);
      throw err;
    }
  },

  /**
   * Delete / withdraw a complaint by ID (owner only, pending status)
   */
  async deleteComplaint(id) {
    const response = await api.delete(API_ENDPOINTS.COMPLAINTS.GET_BY_ID(id));
    return response.data;
  },

  /**
   * Get aggregate complaint statistics
   */
  async getComplaintStats() {
    try {
      const response = await api.get(API_ENDPOINTS.COMPLAINTS.STATS);
      if (response.data?.stats) {
        return response.data.stats;
      }

      // Fallback if stats object not in direct response
      const listRes = await api.get(API_ENDPOINTS.COMPLAINTS.LIST);
      const raw = listRes.data?.complaints ?? listRes.data?.data ?? listRes.data;
      const list = Array.isArray(raw) ? raw : [];
      return {
        total: list.length,
        pending: list.filter((c) => c.status === "pending").length,
        inProgress: list.filter((c) => c.status === "in-progress").length,
        resolved: list.filter((c) => c.status === "resolved").length,
      };
    } catch {
      // Offline / mock fallback
      const list = getStoredComplaints();
      return {
        total: list.length,
        pending: list.filter((c) => c.status === "pending").length,
        inProgress: list.filter((c) => c.status === "in-progress").length,
        resolved: list.filter((c) => c.status === "resolved").length,
      };
    }
  },
};

export default complaintService;
