import {
  addMember,
  getMemberById,
  listAdminMembers,
  listPublicMembers,
  updateMemberById,
  softDeleteMemberById,
  restoreMemberById,
  permanentlyDeleteMemberById,
  reorderCorporateMembers,
} from '../services/corporate.service.js';
import { sendCreated, sendError, sendSuccess } from '../utils/apiResponse.js';

export const getPublicMembers = async (_req, res, next) => {
  try {
    const data = await listPublicMembers();
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const getAdminMembers = async (_req, res, next) => {
  try {
    const deletedOnly = String(_req.query.deletedOnly || '').toLowerCase() === 'true';
    const includeDeleted = String(_req.query.includeDeleted || '').toLowerCase() === 'true';
    const data = await listAdminMembers({ deletedOnly, includeDeleted });
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const createMember = async (req, res, next) => {
  try {
    const { categoryId, ...body } = req.body;
    const payload = {
      ...body,
      category: categoryId || null,
      createdBy: req.user.username,
      updatedBy: req.user.username,
    };

    const createdMember = await addMember(payload);
    sendCreated(res, { data: createdMember });
  } catch (error) {
    next(error);
  }
};

export const updateMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getMemberById(id);

    if (!existing) {
      return sendError(res, 404, 'Corporate member not found');
    }

    const { categoryId, ...body } = req.body;
    const updated = await updateMemberById(id, {
      ...body,
      ...(categoryId !== undefined ? { category: categoryId || null } : {}),
      updatedBy: req.user.username,
    });

    sendSuccess(res, { data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getMemberById(id);

    if (!existing) {
      return sendError(res, 404, 'Corporate member not found');
    }

    const deleted = await softDeleteMemberById(id, req.user.username);
    sendSuccess(res, { data: deleted, message: 'Corporate member deleted' });
  } catch (error) {
    next(error);
  }
};

export const restoreMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getMemberById(id);

    if (!existing) {
      return sendError(res, 404, 'Corporate member not found');
    }

    const restored = await restoreMemberById(id, req.user.username);
    sendSuccess(res, { data: restored, message: 'Corporate member restored' });
  } catch (error) {
    next(error);
  }
};

export const permanentlyDelete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getMemberById(id);

    if (!existing) {
      return sendError(res, 404, 'Corporate member not found');
    }

    await permanentlyDeleteMemberById(id);
    sendSuccess(res, { message: 'Corporate member permanently deleted' });
  } catch (error) {
    next(error);
  }
};

export const reorderMembers = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    const data = await reorderCorporateMembers(orderedIds);
    sendSuccess(res, { data, message: 'Corporate members reordered' });
  } catch (error) {
    next(error);
  }
};
