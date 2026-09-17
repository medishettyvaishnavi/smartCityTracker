/**
 * Smart City Tracker — API Contracts & Schema Definitions
 *
 * This file serves as the official contract between frontend and backend.
 * When building the backend, implement endpoints according to these schemas.
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
  },
  COMPLAINTS: {
    LIST: "/complaints",
    CREATE: "/complaints",
    GET_BY_ID: (id) => `/complaints/${id}`,
    UPDATE_STATUS: (id) => `/complaints/${id}/status`,
    STATS: "/complaints/stats",
  },
  CATEGORIES: {
    LIST: "/categories",
  },
  ADMIN: {
    COMPLAINTS: "/admin/complaints",
    ADMINS: "/admin/admins",
    STATS: "/admin/stats",
    UPDATE_STATUS: (id) => `/admin/complaints/${id}/status`,
    ASSIGN: (id) => `/admin/complaints/${id}/assign`,
  },
};

/**
 * Expected HTTP Status Codes:
 * - 200 OK: Successful query / read
 * - 201 Created: Resource created (new complaint, registered user)
 * - 400 Bad Request: Missing or invalid body parameters
 * - 401 Unauthorized: Invalid credentials or expired JWT token
 * - 403 Forbidden: Insufficient permissions
 * - 404 Not Found: Resource (e.g. complaint ID) does not exist
 * - 500 Internal Server Error: Unexpected backend issue
 */

/**
 * Data Contracts Reference:
 *
 * Auth Login Request:
 *   POST /api/auth/login
 *   Body: { email: string, password: string }
 *   Response: { success: boolean, token: string, user: UserProfile }
 *
 * Auth Register Request:
 *   POST /api/auth/register
 *   Body: { fullName: string, email: string, phone: string, city: string, password: string }
 *   Response: { success: boolean, token: string, user: UserProfile }
 *
 * Create Complaint Request:
 *   POST /api/complaints
 *   Body (or multipart/form-data): {
 *     title: string,
 *     description: string,
 *     category: string,
 *     priority: 'low' | 'medium' | 'high',
 *     address: string,
 *     pincode?: string,
 *     image?: string | File
 *   }
 *   Response: { success: boolean, data: Complaint }
 *
 * Complaints List Request:
 *   GET /api/complaints?status=pending&search=pothole&sortBy=newest
 *   Response: { success: boolean, data: Complaint[], total: number }
 *
 * Complaint Details Request:
 *   GET /api/complaints/:id
 *   Response: { success: boolean, data: Complaint }
 *
 * Complaint Stats Request:
 *   GET /api/complaints/stats
 *   Response: {
 *     total: number,
 *     pending: number,
 *     inProgress: number,
 *     resolved: number
 *   }
 */
