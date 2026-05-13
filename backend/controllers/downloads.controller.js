import {
  addDownload,
  approveDownloadById,
  deleteDownloadById,
  getDownloadAnyStatusById,
  getDownloadById,
  listAdminDownloads,
  listDeletedDownloads,
  listPublicDownloads,
  permanentlyDeleteDownloadById,
  rejectDownloadById,
  restoreDownloadById,
  updateDownloadById,
} from '../services/downloads.service.js';
import Download from '../models/Download.js';
import { deleteUploadedFileByRelativePath } from '../utils/uploadPath.js';
import { sendCreated, sendError, sendSuccess } from '../utils/apiResponse.js';

const getNextDisplayOrder = async () => {
  const count = await Download.countDocuments();
  return count + 1;
};

export const getPublicDownloads = async (_req, res, next) => {
  try {
    const data = await listPublicDownloads();
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const getAdminDownloads = async (_req, res, next) => {
  try {
    const data = await listAdminDownloads();
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const getDownload = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await getDownloadById(id);

    if (!data) {
      return sendError(res, 404, 'Download item not found');
    }

    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const createDownload = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      displayOrder: Number(req.body.displayOrder || 0) || (await getNextDisplayOrder()),
      createdBy: req.user.username,
      updatedBy: req.user.username,
    };

    const created = await addDownload(payload);
    sendCreated(res, { data: created });
  } catch (error) {
    next(error);
  }
};

export const updateDownload = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getDownloadById(id);

    if (!existing) {
      return sendError(res, 404, 'Download item not found');
    }

    const updated = await updateDownloadById(id, {
      ...req.body,
      updatedBy: req.user.username,
      approved: false,
      approvedBy: null,
      approvedAt: null,
      rejected: false,
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: '',
    });

    if (req.body.fileUrl && existing.fileUrl && req.body.fileUrl !== existing.fileUrl) {
      deleteUploadedFileByRelativePath(existing.fileUrl);
    }

    sendSuccess(res, { data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteDownload = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getDownloadById(id);

    if (!existing) {
      return sendError(res, 404, 'Download item not found');
    }

    await deleteDownloadById(id, req.user.username);
    // Soft delete preserves the file on disk so it can be restored later or audited

    sendSuccess(res, { message: 'Download item deleted' });
  } catch (error) {
    next(error);
  }
};

export const approveDownload = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await getDownloadById(id);
    if (!existing) {
      return sendError(res, 404, 'Download item not found');
    }

    const updated = await approveDownloadById(id, req.user.username);
    sendSuccess(res, { data: updated, message: 'Download item approved' });
  } catch (error) {
    next(error);
  }
};

export const rejectDownload = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const existing = await getDownloadById(id);
    if (!existing) {
      return sendError(res, 404, 'Download item not found');
    }

    const updated = await rejectDownloadById(id, req.user.username, rejectionReason || '');
    sendSuccess(res, { data: updated, message: 'Download item rejected' });
  } catch (error) {
    next(error);
  }
};

export const getDeletedDownloads = async (_req, res, next) => {
  try {
    const data = await listDeletedDownloads();
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const restoreDownload = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getDownloadAnyStatusById(id);

    if (!existing) {
      return sendError(res, 404, 'Download item not found');
    }

    if (!existing.isDeleted) {
      return sendError(res, 400, 'Download item is not deleted');
    }

    const restored = await restoreDownloadById(id, req.user.username);
    sendSuccess(res, { data: restored, message: 'Download item restored' });
  } catch (error) {
    next(error);
  }
};

export const permanentlyDeleteDownload = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getDownloadAnyStatusById(id);

    if (!existing) {
      return sendError(res, 404, 'Download item not found');
    }

    if (!existing.isDeleted) {
      return sendError(res, 400, 'Cannot permanently delete an active download. Delete it first.');
    }

    await permanentlyDeleteDownloadById(id);
    if (existing.fileUrl) {
      deleteUploadedFileByRelativePath(existing.fileUrl);
    }

    sendSuccess(res, { message: 'Download item permanently deleted' });
  } catch (error) {
    next(error);
  }
};
