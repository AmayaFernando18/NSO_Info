import {
  addCategory,
  getCategoryById,
  listAdminCategories,
  listPublicCategories,
  updateCategoryById,
  deleteCategoryById,
  detachMembersFromCategory,
} from '../services/corporateCategory.service.js';
import { sendCreated, sendError, sendSuccess } from '../utils/apiResponse.js';

export const getPublicCategories = async (_req, res, next) => {
  try {
    const data = await listPublicCategories();
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const getAdminCategories = async (_req, res, next) => {
  try {
    const data = await listAdminCategories();
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user.username,
      updatedBy: req.user.username,
    };

    const created = await addCategory(payload);
    sendCreated(res, { data: created });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getCategoryById(id);

    if (!existing) {
      return sendError(res, 404, 'Corporate category not found');
    }

    const updated = await updateCategoryById(id, {
      ...req.body,
      updatedBy: req.user.username,
    });

    sendSuccess(res, { data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getCategoryById(id);

    if (!existing) {
      return sendError(res, 404, 'Corporate category not found');
    }

    await detachMembersFromCategory(id);
    await deleteCategoryById(id);

    sendSuccess(res, { message: 'Corporate category deleted' });
  } catch (error) {
    next(error);
  }
};
