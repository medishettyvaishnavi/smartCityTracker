import api from "./api";
import { API_ENDPOINTS } from "./apiContracts";

export const adminService = {
  /**
   * Get all complaints (admin view) with optional filters
   */
  async getComplaints(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "all") params.append("status", filters.status);
    if (filters.category && filters.category !== "all") params.append("category", filters.category);
    if (filters.priority && filters.priority !== "all") params.append("priority", filters.priority);
    if (filters.search) params.append("search", filters.search);

    const response = await api.get(`${API_ENDPOINTS.ADMIN.COMPLAINTS}?${params.toString()}`);
    return response.data;
  },

  /**
   * Get dashboard statistics
   */
  async getStats() {
    const response = await api.get(API_ENDPOINTS.ADMIN.STATS);
    return response.data;
  },

  /**
   * Update complaint status and optionally add an admin note
   */
  async updateComplaintStatus(id, status, adminNote) {
    const body = { status };
    if (adminNote !== undefined) body.adminNote = adminNote;
    const response = await api.put(API_ENDPOINTS.ADMIN.UPDATE_STATUS(id), body);
    return response.data;
  },

  /**
   * Fetch all users with admin role (kept from previous version)
   */
  async getAdmins() {
    const response = await api.get(API_ENDPOINTS.ADMIN.ADMINS);
    return response.data;
  },

  /**
   * Assign a complaint to a specific admin (kept from previous version)
   */
  async assignComplaint(complaintId, adminId) {
    const response = await api.put(API_ENDPOINTS.ADMIN.ASSIGN(complaintId), {
      assignedTo: adminId,
    });
    return response.data;
  },
};

export default adminService;
