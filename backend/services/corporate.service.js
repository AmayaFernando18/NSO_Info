/**
 * Corporate Member service - database access helpers for corporate member management
 * Provides queries and mutation helpers used by controllers for listing,
 * creating, updating, and deleting corporate members.
 */
import CorporateMember from '../models/CorporateMember.js';

export const listPublicMembers = async () =>
  CorporateMember.find({ activeStatus: true, deletedAt: null })
    .populate('category', 'name activeStatus displayOrder')
    .sort({ displayOrder: 1, createdAt: -1 });

export const listAdminMembers = async ({ deletedOnly = false, includeDeleted = false } = {}) => {
  if (deletedOnly) {
    return CorporateMember.find({ deletedAt: { $ne: null } })
      .populate('category', 'name activeStatus displayOrder')
      .sort({ deletedAt: -1, createdAt: -1 });
  }

  if (includeDeleted) {
    return CorporateMember.find()
      .populate('category', 'name activeStatus displayOrder')
      .sort({ displayOrder: 1, createdAt: -1 });
  }

  return CorporateMember.find({ deletedAt: null })
    .populate('category', 'name activeStatus displayOrder')
    .sort({ displayOrder: 1, createdAt: -1 });
};

export const addMember = async (payload) => CorporateMember.create(payload);

export const updateMemberById = async (id, payload) =>
  CorporateMember.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

export const getMemberById = async (id) => CorporateMember.findById(id);

export const softDeleteMemberById = async (id, deletedBy) =>
  CorporateMember.findByIdAndUpdate(
    id,
    {
      deletedAt: new Date(),
      deletedBy,
    },
    { new: true, runValidators: true }
  );

export const restoreMemberById = async (id, restoredBy) =>
  CorporateMember.findByIdAndUpdate(
    id,
    {
      deletedAt: null,
      deletedBy: '',
      updatedBy: restoredBy,
    },
    { new: true, runValidators: true }
  );

export const permanentlyDeleteMemberById = async (id) => CorporateMember.findByIdAndDelete(id);

export const reorderCorporateMembers = async (orderedIds) => {
  const operations = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id, deletedAt: null },
      update: { displayOrder: index + 1 },
    },
  }));

  if (operations.length > 0) {
    await CorporateMember.bulkWrite(operations);
  }

  return listAdminMembers();
};
