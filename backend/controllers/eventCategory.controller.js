import {
  addEventCategory,
  deleteEventCategoryById,
  ensureDefaultEventCategories,
  getEventCategoryById,
  listAdminEventCategories,
  listPublicEventCategories,
  updateEventCategoryById,
} from '../services/eventCategory.service.js';
import { sendCreated, sendError, sendSuccess } from '../utils/apiResponse.js';

export const getPublicEventCategories = async (_req, res, next) => {
  try {
    await ensureDefaultEventCategories();
    const data = await listPublicEventCategories();
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const getAdminEventCategories = async (req, res, next) => {
  try {
    await ensureDefaultEventCategories(req.user?.username || 'system');
    const data = await listAdminEventCategories();
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const createEventCategory = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user.username,
      updatedBy: req.user.username,
    };

    const created = await addEventCategory(payload);
    sendCreated(res, { data: created });
  } catch (error) {
    next(error);
  }
};

export const updateEventCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getEventCategoryById(id);

    if (!existing) {
      return sendError(res, 404, 'Event category not found');
    }

    const updated = await updateEventCategoryById(id, {
      ...req.body,
      updatedBy: req.user.username,
    });

    sendSuccess(res, { data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteEventCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getEventCategoryById(id);

    if (!existing) {
      return sendError(res, 404, 'Event category not found');
    }

    await deleteEventCategoryById(id);
    sendSuccess(res, { message: 'Event category deleted' });
  } catch (error) {
    next(error);
  }
};
