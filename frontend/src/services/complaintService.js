import api from "./api";
import { API_ENDPOINTS } from "./apiContracts";
import { getStoredComplaints, saveComplaintToStore } from "./mockData";

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
        params: { status, search, sortBy },
      });
      return response.data?.data || response.data;
    } catch {
      // Offline / mock fallback with simulated network latency
      await new Promise((r) => setTimeout(r, 300));
      let list = [...getStoredComplaints()];

      // Filter by status
      if (status && status !== "all") {
        list = list.filter((c) => c.status === status);
      }

      // Filter by search query
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

      // Sort
      if (sortBy === "newest") {
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (sortBy === "oldest") {
        list.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (sortBy === "priority") {
        const order = { high: 0, medium: 1, low: 2 };
        list.sort((a, b) => (order[a.priority] ?? 1) - (order[b.priority] ?? 1));
      }

      return list;
    }
  },

  /**
   * Fetch a single complaint by ID
   */
  async getComplaintById(id) {
    try {
      const response = await api.get(API_ENDPOINTS.COMPLAINTS.GET_BY_ID(id));
      return response.data?.data || response.data;
    } catch {
      // Offline / mock fallback
      await new Promise((r) => setTimeout(r, 200));
      const list = getStoredComplaints();
      const complaint = list.find((c) => c.id === id);
      if (!complaint) {
        throw new Error(`Complaint with ID ${id} was not found.`);
      }
      return complaint;
    }
  },

  /**
   * Create and submit a new complaint
   */
  async createComplaint(complaintData) {
    try {
      const response = await api.post(API_ENDPOINTS.COMPLAINTS.CREATE, complaintData);
      return response.data?.data || response.data;
    } catch {
      // Offline / mock fallback
      await new Promise((r) => setTimeout(r, 800));

      const categoryIcons = {
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

      const categoryLabels = {
        roads: "Roads",
        water: "Water",
        electricity: "Electricity",
        sanitation: "Sanitation",
        streetlights: "Street Lights",
        parks: "Parks",
        drainage: "Drainage",
        noise: "Noise",
        traffic: "Traffic",
        other: "Other",
      };

      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const newId = `SCT-${Date.now().toString().slice(-6)}`;

      const newComplaint = {
        id: newId,
        title: complaintData.title || `${categoryLabels[complaintData.category] || "Issue"} reported`,
        category: categoryLabels[complaintData.category] || complaintData.category || "General",
        categoryIcon: categoryIcons[complaintData.category] || "📋",
        status: "pending",
        priority: complaintData.priority || "medium",
        date: dateStr,
        updatedAt: dateStr,
        address: complaintData.address || "Reported Location",
        pincode: complaintData.pincode || "560001",
        description: complaintData.description || "",
        imagePreview: complaintData.imagePreview || null,
        timeline: [
          {
            date: dateStr,
            event: "Complaint filed",
            note: "Submitted by citizen.",
            icon: "📋",
          },
        ],
      };

      saveComplaintToStore(newComplaint);
      return newComplaint;
    }
  },

  /**
   * Get aggregate complaint statistics
   */
  async getComplaintStats() {
    try {
      const response = await api.get(API_ENDPOINTS.COMPLAINTS.STATS);
      return response.data?.data || response.data;
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
