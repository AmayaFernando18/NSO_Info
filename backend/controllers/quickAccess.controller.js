import {
  addQuickAccess,
  approveQuickAccessById,
  getQuickAccessById,
  listAdminQuickAccess,
  listPublicQuickAccess,
  permanentlyDeleteQuickAccessById,
  rejectQuickAccessById,
  reorderQuickAccess,
  restoreQuickAccessById,
  softDeleteQuickAccessById,
  updateQuickAccessById,
} from '../services/quickAccess.service.js';
import { sendCreated, sendError, sendSuccess } from '../utils/apiResponse.js';
import { canEditUnapproved } from '../utils/rbacHelpers.js';
import { RBAC_FUNCTION } from '../config/rbacFunctions.js';

const FUNCTION_NAME = RBAC_FUNCTION.QUICK_ACCESS;

export const getPublicQuickAccess = async (_req, res, next) => {
  try {
    const data = await listPublicQuickAccess();
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const getAdminQuickAccess = async (req, res, next) => {
  try {
    const deletedOnly = String(req.query.deletedOnly || '').toLowerCase() === 'true';
    const includeDeleted = String(req.query.includeDeleted || '').toLowerCase() === 'true';
    const data = await listAdminQuickAccess({ deletedOnly, includeDeleted });
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const createQuickAccess = async (req, res, next) => {
  try {
    const created = await addQuickAccess({
      ...req.body,
      createdBy: req.user.username,
      updatedBy: req.user.username,
      approved: false,
      approvedBy: '',
      approvedAt: null,
      rejected: false,
      rejectedBy: '',
      rejectionReason: '',
      rejectedAt: null,
    });
    sendCreated(res, { data: created });
  } catch (error) {
    next(error);
  }
};

export const updateQuickAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getQuickAccessById(id);

    if (!existing) {
      return sendError(res, 404, 'Quick access item not found');
    }

    if (!canEditUnapproved(req.user, FUNCTION_NAME, existing.approved)) {
      return sendError(res, 403, 'Forbidden: You cannot edit this quick access item');
    }

    const updated = await updateQuickAccessById(id, {
      ...req.body,
      updatedBy: req.user.username,
      approved: false,
      approvedBy: '',
      approvedAt: null,
      rejected: false,
      rejectedBy: '',
      rejectionReason: '',
      rejectedAt: null,
    });

    sendSuccess(res, { data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteQuickAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getQuickAccessById(id);

    if (!existing) {
      return sendError(res, 404, 'Quick access item not found');
    }

    if (existing.isDeleted) {
      return sendError(res, 400, 'Quick access item is already deleted');
    }

    const deleted = await softDeleteQuickAccessById(id, req.user.username);
    sendSuccess(res, { data: deleted, message: 'Quick access item moved to deleted items' });
  } catch (error) {
    next(error);
  }
};

export const restoreQuickAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getQuickAccessById(id);

    if (!existing) {
      return sendError(res, 404, 'Quick access item not found');
    }

    if (!existing.isDeleted) {
      return sendError(res, 400, 'Quick access item is not deleted');
    }

    const restored = await restoreQuickAccessById(id, req.user.username);
    sendSuccess(res, { data: restored, message: 'Quick access item restored' });
  } catch (error) {
    next(error);
  }
};

export const permanentlyDeleteQuickAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getQuickAccessById(id);

    if (!existing) {
      return sendError(res, 404, 'Quick access item not found');
    }

    if (!existing.isDeleted) {
      return sendError(res, 400, 'Only deleted quick access items can be permanently removed');
    }

    await permanentlyDeleteQuickAccessById(id);
    sendSuccess(res, { message: 'Quick access item permanently deleted' });
  } catch (error) {
    next(error);
  }
};

export const reorderQuickAccessController = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    const data = await reorderQuickAccess(orderedIds);
    sendSuccess(res, { data, message: 'Quick access reordered' });
  } catch (error) {
    next(error);
  }
};

export const approveQuickAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getQuickAccessById(id);

    if (!existing) {
      return sendError(res, 404, 'Quick access item not found');
    }

    const updated = await approveQuickAccessById(id, req.user.username);
    sendSuccess(res, { data: updated, message: 'Quick access item approved' });
  } catch (error) {
    next(error);
  }
};

export const rejectQuickAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const existing = await getQuickAccessById(id);

    if (!existing) {
      return sendError(res, 404, 'Quick access item not found');
    }

    const updated = await rejectQuickAccessById(id, req.user.username, rejectionReason || '');
    sendSuccess(res, { data: updated, message: 'Quick access item rejected' });
  } catch (error) {
    next(error);
  }
};
