/**
 * Centralized Mock Data Layer
 * Single source of truth for mock complaints, categories, priorities, and user profiles.
 */

export const MOCK_USER = {
  id: "USR-001",
  name: "Vaishnavi M.",
  email: "test@smartcity.com",
  initials: "VM",
  city: "Bengaluru",
  joinedAt: "September 2026",
};

export const INITIAL_MOCK_COMPLAINTS = [
  {
    id: "SCT-100241",
    title: "Large pothole causing accidents on MG Road",
    category: "Roads",
    categoryIcon: "🛣️",
    status: "resolved",
    priority: "high",
    date: "2026-09-10",
    updatedAt: "2026-09-12",
    address: "MG Road, near Bus Stand, Ward 76",
    pincode: "560001",
    description:
      "A large pothole has formed in the middle of MG Road causing vehicle damage and significant traffic slowdowns. Multiple two-wheelers have had accidents due to this issue.",
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
    category: "Water",
    categoryIcon: "💧",
    status: "in-progress",
    priority: "high",
    date: "2026-09-08",
    updatedAt: "2026-09-11",
    address: "Residency Road, Ward 22",
    pincode: "560025",
    description:
      "Underground pipeline has burst and water has been leaking continuously for 3 days. This is resulting in severe water loss and the road surface is becoming waterlogged.",
    timeline: [
      { date: "2026-09-08", event: "Complaint filed", note: "Submitted by citizen.", icon: "📋" },
      { date: "2026-09-09", event: "Under Review", note: "BWSSB notified.", icon: "🔍" },
      { date: "2026-09-11", event: "In Progress", note: "Repair crew dispatched to site.", icon: "🔧" },
    ],
  },
  {
    id: "SCT-100174",
    title: "Street lights not working for 2 weeks",
    category: "Electricity",
    categoryIcon: "⚡",
    status: "pending",
    priority: "medium",
    date: "2026-09-05",
    updatedAt: "2026-09-05",
    address: "100 Feet Road, Indiranagar, Ward 45",
    pincode: "560038",
    description:
      "Six consecutive street lights have been non-functional for two weeks, making the stretch extremely unsafe at night for pedestrians and motorists alike.",
    timeline: [
      { date: "2026-09-05", event: "Complaint filed", note: "Submitted by citizen.", icon: "📋" },
    ],
  },
  {
    id: "SCT-100155",
    title: "Garbage not collected for over a week",
    category: "Sanitation",
    categoryIcon: "🗑️",
    status: "resolved",
    priority: "medium",
    date: "2026-09-02",
    updatedAt: "2026-09-09",
    address: "Koramangala 5th Block, Ward 11",
    pincode: "560095",
    description:
      "Municipal garbage truck has not visited the area for 8 days causing garbage bins to overflow onto the footpath creating health hazards.",
    timeline: [
      { date: "2026-09-02", event: "Complaint filed", note: "Submitted by citizen.", icon: "📋" },
      { date: "2026-09-04", event: "Under Review", note: "BBMP Sanitation dept. alerted.", icon: "🔍" },
      { date: "2026-09-09", event: "Resolved", note: "Garbage cleared and schedule regularised.", icon: "✅" },
    ],
  },
  {
    id: "SCT-100132",
    title: "Signal at junction non-functional",
    category: "Traffic",
    categoryIcon: "🚦",
    status: "in-progress",
    priority: "high",
    date: "2026-08-30",
    updatedAt: "2026-09-07",
    address: "Silk Board Junction, Ward 63",
    pincode: "560068",
    description:
      "Traffic signal has been non-functional since Monday causing massive congestion during peak hours. Police deployment is inadequate.",
    timeline: [
      { date: "2026-08-30", event: "Complaint filed", note: "Submitted by citizen.", icon: "📋" },
      { date: "2026-09-01", event: "Under Review", note: "Traffic police & BBMP notified.", icon: "🔍" },
      { date: "2026-09-07", event: "In Progress", note: "Technician visit scheduled.", icon: "🔧" },
    ],
  },
  {
    id: "SCT-100109",
    title: "Sewage overflowing into street",
    category: "Drainage",
    categoryIcon: "🌊",
    status: "pending",
    priority: "high",
    date: "2026-08-27",
    updatedAt: "2026-08-27",
    address: "BTM Layout, Ward 38",
    pincode: "560076",
    description:
      "Blocked drainage is causing raw sewage to overflow onto the pedestrian walkway creating an unsanitary and hazardous environment.",
    timeline: [
      { date: "2026-08-27", event: "Complaint filed", note: "Submitted by citizen.", icon: "📋" },
    ],
  },
  {
    id: "SCT-100088",
    title: "Park benches vandalized and broken",
    category: "Parks",
    categoryIcon: "🌳",
    status: "pending",
    priority: "low",
    date: "2026-08-22",
    updatedAt: "2026-08-22",
    address: "Cubbon Park East Gate, Ward 55",
    pincode: "560001",
    description:
      "Multiple park benches have been vandalized and present a safety hazard. Broken metal edges could cause injuries to visitors.",
    timeline: [
      { date: "2026-08-22", event: "Complaint filed", note: "Submitted by citizen.", icon: "📋" },
    ],
  },
];

const COMPLAINTS_STORAGE_KEY = "sct_mock_complaints";

/**
 * Get all mock complaints (merged with any complaints submitted during this session)
 */
export function getStoredComplaints() {
  try {
    const raw = sessionStorage.getItem(COMPLAINTS_STORAGE_KEY);
    if (!raw) {
      sessionStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_COMPLAINTS));
      return INITIAL_MOCK_COMPLAINTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_MOCK_COMPLAINTS;
  } catch {
    return INITIAL_MOCK_COMPLAINTS;
  }
}

/**
 * Save a new complaint to sessionStorage mock data
 */
export function saveComplaintToStore(complaint) {
  try {
    const current = getStoredComplaints();
    const updated = [complaint, ...current];
    sessionStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify(updated));
    return complaint;
  } catch (e) {
    console.error("Failed to save mock complaint to sessionStorage", e);
    return complaint;
  }
}
