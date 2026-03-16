import {
  addEvent,
  approveEventById,
  getEventById,
  listAdminEvents,
  listPublicEvents,
  listUpcomingPublicEvents,
  listEventsByDateRange,
  updateEventById,
  rejectEventById,
  restoreEventById,
  softDeleteEventById,
  permanentlyDeleteEventById,
  getSriLankanHolidays,
  getSriLankanSpecialDays,
} from '../services/events.service.js';
import { sendCreated, sendError, sendSuccess } from '../utils/apiResponse.js';
import { canEditUnapproved } from '../utils/rbacHelpers.js';
import { RBAC_FUNCTION } from '../config/rbacFunctions.js';

const FUNCTION_NAME = RBAC_FUNCTION.EVENTS;

export const getPublicEvents = async (_req, res, next) => {
  try {
    const data = await listPublicEvents();
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingEvents = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const data = await listUpcomingPublicEvents(limit);
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const getEventsByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return sendError(res, 400, 'startDate and endDate query parameters are required');
    }

    const data = await listEventsByDateRange(startDate, endDate, true);
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const getAdminEvents = async (req, res, next) => {
  try {
    const deletedOnly = String(req.query.deletedOnly || '').toLowerCase() === 'true';
    const includeDeleted = String(req.query.includeDeleted || '').toLowerCase() === 'true';
    const data = await listAdminEvents({ deletedOnly, includeDeleted });
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user.username,
      updatedBy: req.user.username,
      approved: false,
      approvedBy: '',
      approvedAt: null,
    };

    const createdEvent = await addEvent(payload);
    sendCreated(res, { data: createdEvent });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getEventById(id);

    if (!existing) {
      return sendError(res, 404, 'Event not found');
    }

    // Enter users can update only unapproved entries. Managers can update all.
    if (!canEditUnapproved(req.user, FUNCTION_NAME, existing.approved)) {
      return sendError(res, 403, 'Forbidden: You cannot edit this event');
    }

    const updated = await updateEventById(id, {
      ...req.body,
      updatedBy: req.user.username,
      // Any update requires re-approval to keep publishing workflow safe.
      approved: false,
      approvedBy: '',
      approvedAt: null,
    });

    sendSuccess(res, { data: updated });
  } catch (error) {
    next(error);
  }
};

export const approveEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await getEventById(id);
    if (!existing) {
      return sendError(res, 404, 'Event not found');
    }

    const updated = await approveEventById(id, req.user.username);
    sendSuccess(res, { data: updated, message: 'Event approved' });
  } catch (error) {
    next(error);
  }
};

export const rejectEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const existing = await getEventById(id);
    if (!existing) {
      return sendError(res, 404, 'Event not found');
    }

    const updated = await rejectEventById(id, req.user.username, rejectionReason || '');
    sendSuccess(res, { data: updated, message: 'Event rejected' });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getEventById(id);

    if (!existing) {
      return sendError(res, 404, 'Event not found');
    }

    if (existing.isDeleted) {
      return sendError(res, 400, 'Event is already deleted');
    }

    const deleted = await softDeleteEventById(id, req.user.username);

    if (!deleted) {
      return sendError(res, 404, 'Event not found');
    }

    sendSuccess(res, { data: deleted, message: 'Event moved to deleted items' });
  } catch (error) {
    next(error);
  }
};

export const restoreEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getEventById(id);

    if (!existing) {
      return sendError(res, 404, 'Event not found');
    }

    if (!existing.isDeleted) {
      return sendError(res, 400, 'Event is not deleted');
    }

    const restored = await restoreEventById(id, req.user.username);
    sendSuccess(res, { data: restored, message: 'Event restored' });
  } catch (error) {
    next(error);
  }
};

export const permanentlyDeleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getEventById(id);

    if (!existing) {
      return sendError(res, 404, 'Event not found');
    }

    if (!existing.isDeleted) {
      return sendError(res, 400, 'Only deleted events can be permanently removed');
    }

    await permanentlyDeleteEventById(id);
    sendSuccess(res, { message: 'Event permanently deleted' });
  } catch (error) {
    next(error);
  }
};

export const getHolidays = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || 2026;
    const holidays = getSriLankanHolidays(year);
    const specialDays = getSriLankanSpecialDays(year);
    sendSuccess(res, { data: { holidays, specialDays } });
  } catch (error) {
    next(error);
  }
};

export const getCalendarData = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const currentYear = parseInt(year, 10) || new Date().getFullYear();
    const currentMonth = parseInt(month, 10) || new Date().getMonth() + 1;

    // Calculate date range for the month
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    // Get events for the month
    const events = await listEventsByDateRange(
      startDate.toISOString(),
      endDate.toISOString(),
      true
    );

    // Get holidays and special days
    const holidays = getSriLankanHolidays(currentYear).filter((h) => {
      const hDate = new Date(h.date);
      return hDate >= startDate && hDate <= endDate;
    });

    const specialDays = getSriLankanSpecialDays(currentYear).filter((s) => {
      const sDate = new Date(s.date);
      return sDate >= startDate && sDate <= endDate;
    });

    sendSuccess(res, {
      data: {
        events,
        holidays,
        specialDays,
        year: currentYear,
        month: currentMonth,
      },
    });
  } catch (error) {
    next(error);
  }
};
