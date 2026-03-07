/**
 * News service - database access helpers for news workflow
 * Provides queries and mutation helpers used by controllers for listing,
 * creating, updating, approving, soft-deleting and permanently deleting news items.
 */
import News from '../models/News.js';

export const listPublicNews = async () =>
  News.find({ activeStatus: true, approved: true, isDeleted: false }).sort({ publishedAt: -1, createdAt: -1 });

export const listAdminNews = async ({ deletedOnly = false, includeDeleted = false } = {}) => {
  if (deletedOnly) {
    return News.find({ isDeleted: true }).sort({ deletedAt: -1, createdAt: -1 });
  }

  if (includeDeleted) {
    return News.find().sort({ createdAt: -1 });
  }

  return News.find({ isDeleted: false }).sort({ createdAt: -1 });
};

export const addNews = async (payload) => News.create(payload);

export const updateNewsById = async (id, payload) =>
  News.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

export const getNewsById = async (id) => News.findById(id);

export const approveNewsById = async (id, approverUsername) =>
  News.findByIdAndUpdate(
    id,
    {
      approved: true,
      approvedBy: approverUsername,
      approvedAt: new Date(),
      updatedBy: approverUsername,
    },
    { new: true, runValidators: true }
  );

export const softDeleteNewsById = async (id, deletedBy) =>
  News.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
    },
    { new: true, runValidators: true }
  );

export const restoreNewsById = async (id, restoredBy) =>
  News.findByIdAndUpdate(
    id,
    {
      isDeleted: false,
      deletedAt: null,
      deletedBy: '',
      updatedBy: restoredBy,
    },
    { new: true, runValidators: true }
  );

export const permanentlyDeleteNewsById = async (id) => News.findByIdAndDelete(id);

export const rejectNewsById = async (id, rejectedBy, rejectionReason) =>
  News.findByIdAndUpdate(
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
