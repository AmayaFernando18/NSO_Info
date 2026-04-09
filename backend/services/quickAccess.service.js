import QuickAccess from '../models/QuickAccess.js';

export const listPublicQuickAccess = async () =>
  QuickAccess.find({ activeStatus: true, approved: true, isDeleted: false }).sort({ order: 1, createdAt: -1 });

export const listAdminQuickAccess = async ({ deletedOnly = false, includeDeleted = false } = {}) => {
  if (deletedOnly) {
    return QuickAccess.find({ isDeleted: true }).sort({ deletedAt: -1, createdAt: -1 });
  }

  if (includeDeleted) {
    return QuickAccess.find().sort({ order: 1, createdAt: -1 });
  }

  return QuickAccess.find({ isDeleted: false }).sort({ order: 1, createdAt: -1 });
};

export const getQuickAccessById = async (id) => QuickAccess.findById(id);

export const addQuickAccess = async (payload) => QuickAccess.create(payload);

export const updateQuickAccessById = async (id, payload) =>
  QuickAccess.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

export const approveQuickAccessById = async (id, approverUsername) =>
  QuickAccess.findByIdAndUpdate(
    id,
    {
      approved: true,
      approvedBy: approverUsername,
      approvedAt: new Date(),
      rejected: false,
      rejectedBy: '',
      rejectionReason: '',
      rejectedAt: null,
      updatedBy: approverUsername,
    },
    { new: true, runValidators: true }
  );

export const rejectQuickAccessById = async (id, rejectedBy, rejectionReason) =>
  QuickAccess.findByIdAndUpdate(
    id,
    {
      rejected: true,
      rejectedBy,
      rejectionReason,
      rejectedAt: new Date(),
      approved: false,
      approvedBy: '',
      approvedAt: null,
      updatedBy: rejectedBy,
    },
    { new: true, runValidators: true }
  );

export const softDeleteQuickAccessById = async (id, deletedBy) =>
  QuickAccess.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
    },
    { new: true, runValidators: true }
  );

export const restoreQuickAccessById = async (id, restoredBy) =>
  QuickAccess.findByIdAndUpdate(
    id,
    {
      isDeleted: false,
      deletedAt: null,
      deletedBy: '',
      updatedBy: restoredBy,
    },
    { new: true, runValidators: true }
  );

export const permanentlyDeleteQuickAccessById = async (id) => QuickAccess.findByIdAndDelete(id);

export const reorderQuickAccess = async (orderedIds) => {
  const operations = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { order: index + 1 },
    },
  }));

  if (operations.length > 0) {
    await QuickAccess.bulkWrite(operations);
  }

  return listAdminQuickAccess();
};
