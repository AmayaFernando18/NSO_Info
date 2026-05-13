import Download from '../models/Download.js';

const baseSort = { displayOrder: 1, category: 1, title: 1, language: 1, createdAt: 1 };

export const listPublicDownloads = async () =>
  Download.find({ activeStatus: true, isDeleted: { $ne: true } }).sort(baseSort);

export const listAdminDownloads = async () => Download.find({ isDeleted: { $ne: true } }).sort(baseSort);

export const getDownloadById = async (id) => Download.findOne({ _id: id, isDeleted: { $ne: true } });

export const addDownload = async (payload) => Download.create(payload);

export const updateDownloadById = async (id, payload) =>
  Download.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

export const approveDownloadById = async (id, approverUsername) =>
  Download.findByIdAndUpdate(
    id,
    {
      approved: true,
      approvedBy: approverUsername,
      approvedAt: new Date(),
      updatedBy: approverUsername,
      rejected: false,
      rejectedBy: '',
      rejectionReason: '',
      rejectedAt: null,
    },
    { new: true, runValidators: true }
  );

export const rejectDownloadById = async (id, rejectedBy, rejectionReason) =>
  Download.findByIdAndUpdate(
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

export const deleteDownloadById = async (id, deletedBy) =>
  Download.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
      activeStatus: false,
    },
    { new: true }
  );

export const listDeletedDownloads = async () => Download.find({ isDeleted: true }).sort(baseSort);

export const restoreDownloadById = async (id, restoredBy) =>
  Download.findByIdAndUpdate(
    id,
    {
      isDeleted: false,
      deletedAt: null,
      deletedBy: '',
      updatedBy: restoredBy,
    },
    { new: true }
  );

export const permanentlyDeleteDownloadById = async (id) => Download.findByIdAndDelete(id);

export const getDownloadAnyStatusById = async (id) => Download.findById(id);
