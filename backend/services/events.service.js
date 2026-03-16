/**
 * Events service - database access helpers for events workflow
 * Provides queries and mutation helpers used by controllers for listing,
 * creating, updating, approving, soft-deleting and permanently deleting events.
 */
import Event from '../models/Event.js';

// Helper function to generate holidays for any year
const generateHolidaysForYear = (year) => {
  // Fixed-date holidays (same date every year)
  const fixedHolidays = [
    { month: 1, day: 14, title: 'Thai Pongal Day' },
    { month: 2, day: 4, title: 'National Day' },
    { month: 4, day: 13, title: 'Day prior to Sinhala & Tamil New Year Day' },
    { month: 4, day: 14, title: 'Sinhala & Tamil New Year Day' },
    { month: 5, day: 1, title: 'May Day' },
    { month: 12, day: 25, title: 'Christmas Day' },
  ];

  // Convert to full dates
  return fixedHolidays.map((h) => ({
    date: `${year}-${String(h.month).padStart(2, '0')}-${String(h.day).padStart(2, '0')}`,
    title: h.title,
    isHoliday: true,
  }));
};

// Helper function to generate special days for any year
const generateSpecialDaysForYear = (year) => {
  const specialDays = [
    { month: 2, day: 14, title: "Valentine's Day" },
    { month: 3, day: 8, title: "International Women's Day" },
    { month: 11, day: 14, title: "Children's Day" },
  ];

  return specialDays.map((s) => ({
    date: `${year}-${String(s.month).padStart(2, '0')}-${String(s.day).padStart(2, '0')}`,
    title: s.title,
    isSpecialDay: true,
  }));
};

// Sri Lankan public holidays for 2026 (comprehensive list including Poya days)
export const SRI_LANKAN_HOLIDAYS_2026 = [
  { date: '2026-01-14', title: 'Thai Pongal Day', isHoliday: true },
  { date: '2026-01-15', title: 'Duruthu Full Moon Poya Day', isHoliday: true },
  { date: '2026-02-04', title: 'National Day', isHoliday: true },
  { date: '2026-02-13', title: 'Navam Full Moon Poya Day', isHoliday: true },
  { date: '2026-03-15', title: 'Medin Full Moon Poya Day', isHoliday: true },
  { date: '2026-04-02', title: 'Good Friday', isHoliday: true },
  { date: '2026-04-13', title: 'Day prior to Sinhala & Tamil New Year Day', isHoliday: true },
  { date: '2026-04-14', title: 'Sinhala & Tamil New Year Day', isHoliday: true },
  { date: '2026-04-14', title: 'Bak Full Moon Poya Day', isHoliday: true },
  { date: '2026-05-01', title: 'May Day', isHoliday: true },
  { date: '2026-05-13', title: 'Vesak Full Moon Poya Day', isHoliday: true },
  { date: '2026-05-14', title: 'Day following Vesak Full Moon Poya Day', isHoliday: true },
  { date: '2026-06-11', title: 'Poson Full Moon Poya Day', isHoliday: true },
  { date: '2026-07-11', title: 'Esala Full Moon Poya Day', isHoliday: true },
  { date: '2026-08-09', title: 'Nikini Full Moon Poya Day', isHoliday: true },
  { date: '2026-09-07', title: 'Binara Full Moon Poya Day', isHoliday: true },
  { date: '2026-10-07', title: 'Vap Full Moon Poya Day', isHoliday: true },
  { date: '2026-10-20', title: 'Deepavali Festival Day', isHoliday: true },
  { date: '2026-11-05', title: 'Il Full Moon Poya Day', isHoliday: true },
  { date: '2026-12-05', title: 'Unduvap Full Moon Poya Day', isHoliday: true },
  { date: '2026-12-25', title: 'Christmas Day', isHoliday: true },
];

// Special days (non-holiday but notable)
export const SRI_LANKAN_SPECIAL_DAYS_2026 = [
  { date: '2026-02-14', title: "Valentine's Day", isSpecialDay: true },
  { date: '2026-03-08', title: "International Women's Day", isSpecialDay: true },
  { date: '2026-05-10', title: "Mother's Day", isSpecialDay: true },
  { date: '2026-06-21', title: "Father's Day", isSpecialDay: true },
  { date: '2026-09-13', title: "World First Aid Day", isSpecialDay: true },
  { date: '2026-11-14', title: "Children's Day", isSpecialDay: true },
];

export const listPublicEvents = async () =>
  Event.find({ activeStatus: true, approved: true, isDeleted: false })
    .sort({ eventDate: 1 })
    .lean();

export const listUpcomingPublicEvents = async (limit = 10) =>
  Event.find({
    activeStatus: true,
    approved: true,
    isDeleted: false,
    eventDate: { $gte: new Date() },
  })
    .sort({ eventDate: 1 })
    .limit(limit)
    .lean();

export const listAdminEvents = async ({ deletedOnly = false, includeDeleted = false } = {}) => {
  if (deletedOnly) {
    return Event.find({ isDeleted: true }).sort({ deletedAt: -1, createdAt: -1 }).lean();
  }

  if (includeDeleted) {
    return Event.find().sort({ eventDate: 1, createdAt: -1 }).lean();
  }

  return Event.find({ isDeleted: false }).sort({ eventDate: 1, createdAt: -1 }).lean();
};

export const listEventsByDateRange = async (startDate, endDate, publicOnly = true) => {
  const query = {
    eventDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    isDeleted: false,
  };

  if (publicOnly) {
    query.activeStatus = true;
    query.approved = true;
  }

  return Event.find(query).sort({ eventDate: 1 }).lean();
};

export const addEvent = async (payload) => Event.create(payload);

export const updateEventById = async (id, payload) =>
  Event.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

export const getEventById = async (id) => Event.findById(id);

export const approveEventById = async (id, approverUsername) =>
  Event.findByIdAndUpdate(
    id,
    {
      approved: true,
      approvedBy: approverUsername,
      approvedAt: new Date(),
      updatedBy: approverUsername,
      rejected: false,
      rejectedBy: '',
      rejectionReason: '',
      rejectedAt: null,
    },
    { new: true, runValidators: true }
  );

export const rejectEventById = async (id, rejectedBy, rejectionReason) =>
  Event.findByIdAndUpdate(
    id,
    {
      rejected: true,
      rejectedBy,
      rejectionReason,
      rejectedAt: new Date(),
      approved: false,
      approvedBy: '',
      approvedAt: null,
    },
    { new: true }
  );

export const softDeleteEventById = async (id, deletedBy) =>
  Event.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
    },
    { new: true, runValidators: true }
  );

export const restoreEventById = async (id, restoredBy) =>
  Event.findByIdAndUpdate(
    id,
    {
      isDeleted: false,
      deletedAt: null,
      deletedBy: '',
      updatedBy: restoredBy,
    },
    { new: true, runValidators: true }
  );

export const permanentlyDeleteEventById = async (id) => Event.findByIdAndDelete(id);

// Get Sri Lankan holidays and special days for a given year/month
export const getSriLankanHolidays = (year = 2026) => {
  // Return detailed list for 2026, generate basic list for other years
  if (year === 2026) {
    return SRI_LANKAN_HOLIDAYS_2026;
  }
  // For other years, return fixed-date holidays dynamically
  return generateHolidaysForYear(year);
};

export const getSriLankanSpecialDays = (year = 2026) => {
  if (year === 2026) {
    return SRI_LANKAN_SPECIAL_DAYS_2026;
  }
  // For other years, return special days dynamically
  return generateSpecialDaysForYear(year);
};
