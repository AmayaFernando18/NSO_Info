/**
 * Corporate Category service - database access helpers for corporate member categories.
 */
import CorporateCategory from '../models/CorporateCategory.js';
import CorporateMember from '../models/CorporateMember.js';

export const listPublicCategories = async () =>
  CorporateCategory.find({ activeStatus: true }).sort({ displayOrder: 1, name: 1 });

export const listAdminCategories = async () =>
  CorporateCategory.find().sort({ displayOrder: 1, name: 1 });

export const addCategory = async (payload) => CorporateCategory.create(payload);

export const updateCategoryById = async (id, payload) =>
  CorporateCategory.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

export const getCategoryById = async (id) => CorporateCategory.findById(id);

export const detachMembersFromCategory = async (categoryId) =>
  CorporateMember.updateMany({ category: categoryId }, { $set: { category: null } });

export const deleteCategoryById = async (id) => CorporateCategory.findByIdAndDelete(id);
