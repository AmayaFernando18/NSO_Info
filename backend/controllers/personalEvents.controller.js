import {
  addPersonalEvent,
  deletePersonalEventById,
  getPersonalEventById,
  listPersonalEvents,
  listPersonalEventsByDateRange,
  updatePersonalEventById,
} from '../services/personalEvents.service.js';
import { sendCreated, sendError, sendSuccess } from '../utils/apiResponse.js';

const assertOwner = (req, item) => {
  if (!item) return { ok: false, status: 404, message: 'Personal event not found' };
  if (item.ownerUsername !== req.user.username) {
    return { ok: false, status: 403, message: 'Forbidden: You do not own this personal event' };
  }
  return { ok: true };
};

export const getPersonalEvents = async (req, res, next) => {
  try {
    const data = await listPersonalEvents(req.user.username);
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const getPersonalEventsByRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return sendError(res, 400, 'startDate and endDate query parameters are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return sendError(res, 400, 'Invalid date range provided');
    }

    const data = await listPersonalEventsByDateRange(
      req.user.username,
      start.toISOString(),
      end.toISOString()
    );
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const createPersonalEvent = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      ownerUsername: req.user.username,
      createdBy: req.user.username,
      updatedBy: req.user.username,
    };

    const created = await addPersonalEvent(payload);
    sendCreated(res, { data: created });
  } catch (error) {
    next(error);
  }
};

export const updatePersonalEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getPersonalEventById(id);
    const ownership = assertOwner(req, existing);

    if (!ownership.ok) {
      return sendError(res, ownership.status, ownership.message);
    }

    const updated = await updatePersonalEventById(id, {
      ...req.body,
      updatedBy: req.user.username,
    });

    sendSuccess(res, { data: updated });
  } catch (error) {
    next(error);
  }
};

export const deletePersonalEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getPersonalEventById(id);
    const ownership = assertOwner(req, existing);

    if (!ownership.ok) {
      return sendError(res, ownership.status, ownership.message);
    }

    await deletePersonalEventById(id);
    sendSuccess(res, { message: 'Personal event deleted' });
  } catch (error) {
    next(error);
  }
};
