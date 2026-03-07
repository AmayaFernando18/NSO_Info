import {
  addNews,
  approveNewsById,
  permanentlyDeleteNewsById,
  getNewsById,
  listAdminNews,
  listPublicNews,
  updateNewsById,
  rejectNewsById,
  restoreNewsById,
  softDeleteNewsById,
} from '../services/news.service.js';
import { sendCreated, sendError, sendSuccess } from '../utils/apiResponse.js';
import { canEditUnapproved } from '../utils/rbacHelpers.js';
import { RBAC_FUNCTION } from '../config/rbacFunctions.js';

const FUNCTION_NAME = RBAC_FUNCTION.NEWS;

export const getPublicNews = async (_req, res, next) => {
  try {
    const data = await listPublicNews();
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const getAdminNews = async (_req, res, next) => {
  try {
    const deletedOnly = String(_req.query.deletedOnly || '').toLowerCase() === 'true';
    const includeDeleted = String(_req.query.includeDeleted || '').toLowerCase() === 'true';
    const data = await listAdminNews({ deletedOnly, includeDeleted });
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const createNews = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user.username,
      updatedBy: req.user.username,
      approved: false,
      approvedBy: '',
      approvedAt: null,
    };

    const createdNews = await addNews(payload);
    sendCreated(res, { data: createdNews });
  } catch (error) {
    next(error);
  }
};

export const updateNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getNewsById(id);

    if (!existing) {
      return sendError(res, 404, 'News item not found');
    }

    // Enter users can update only unapproved entries. Managers can update all.
    if (!canEditUnapproved(req.user, FUNCTION_NAME, existing.approved)) {
      return sendError(res, 403, 'Forbidden: You cannot edit this news item');
    }

    const updated = await updateNewsById(id, {
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

export const approveNews = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await getNewsById(id);
    if (!existing) {
      return sendError(res, 404, 'News item not found');
    }

    const updated = await approveNewsById(id, req.user.username);
    sendSuccess(res, { data: updated, message: 'News item approved' });
  } catch (error) {
    next(error);
  }
};

export const deleteNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getNewsById(id);

    if (!existing) {
      return sendError(res, 404, 'News item not found');
    }

    if (existing.isDeleted) {
      return sendError(res, 400, 'News item is already deleted');
    }

    const deleted = await softDeleteNewsById(id, req.user.username);

    if (!deleted) {
      return sendError(res, 404, 'News item not found');
    }

    sendSuccess(res, { data: deleted, message: 'News item moved to deleted items' });
  } catch (error) {
    next(error);
  }
};

export const restoreNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getNewsById(id);

    if (!existing) {
      return sendError(res, 404, 'News item not found');
    }

    if (!existing.isDeleted) {
      return sendError(res, 400, 'News item is not deleted');
    }

    const restored = await restoreNewsById(id, req.user.username);
    sendSuccess(res, { data: restored, message: 'News item restored' });
  } catch (error) {
    next(error);
  }
};

export const permanentlyDeleteNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getNewsById(id);

    if (!existing) {
      return sendError(res, 404, 'News item not found');
    }

    if (!existing.isDeleted) {
      return sendError(res, 400, 'Only deleted news can be permanently removed');
    }

    await permanentlyDeleteNewsById(id);
    sendSuccess(res, { message: 'News item permanently deleted' });
  } catch (error) {
    next(error);
  }
};

export const rejectNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const existing = await getNewsById(id);
    if (!existing) {
      return sendError(res, 404, 'News item not found');
    }

    const updated = await rejectNewsById(id, req.user.username, rejectionReason || '');
    sendSuccess(res, { data: updated, message: 'News item rejected' });
  } catch (error) {
    next(error);
  }
};
