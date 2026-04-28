import {
  addAlbum,
  addImageToAlbum,
  approveAlbumById,
  approveImageById,
  rejectAlbumById,
  rejectImageById,
  softDeleteAlbumById,
  softDeleteImageById,
  restoreAlbumById,
  restoreImageById,
  permanentlyDeleteAlbumById,
  permanentlyDeleteImageById,
  getAlbumById,
  getImageById,
  getPublicAlbumWithImages,
  listAdminAlbums,
  listAdminImagesByAlbum,
  listPublicAlbums,
  updateAlbumById,
  updateImageById,
} from '../services/gallery.service.js';
import { sendCreated, sendError, sendSuccess } from '../utils/apiResponse.js';
import { canEditUnapproved } from '../utils/rbacHelpers.js';
import { RBAC_FUNCTION } from '../config/rbacFunctions.js';

const FUNCTION_NAME = RBAC_FUNCTION.GALLERY;

export const getPublicGalleryAlbums = async (_req, res, next) => {
  try {
    const data = await listPublicAlbums();
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const getPublicGalleryAlbumDetail = async (req, res, next) => {
  try {
    const data = await getPublicAlbumWithImages(req.params.id);
    if (!data) {
      return sendError(res, 404, 'Album not found');
    }

    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const getAdminGalleryAlbums = async (_req, res, next) => {
  try {
    const deletedOnly = String(_req.query.deletedOnly || '').toLowerCase() === 'true';
    const includeDeleted = String(_req.query.includeDeleted || '').toLowerCase() === 'true';
    const data = await listAdminAlbums({ deletedOnly, includeDeleted });
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const createGalleryAlbum = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user.username,
      updatedBy: req.user.username,
      approved: false,
      approvedBy: '',
      approvedAt: null,
    };

    const data = await addAlbum(payload);
    sendCreated(res, { data });
  } catch (error) {
    next(error);
  }
};

export const updateGalleryAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getAlbumById(id);

    if (!existing || existing.isDeleted) {
      return sendError(res, 404, 'Album not found');
    }

    // Enter users can update only unapproved entries. Managers can update all.
    if (!canEditUnapproved(req.user, FUNCTION_NAME, existing.approved)) {
      return sendError(res, 403, 'Forbidden: You cannot edit this album');
    }

    const data = await updateAlbumById(id, {
      ...req.body,
      updatedBy: req.user.username,
      // Any update requires re-approval to keep publishing workflow safe.
      approved: false,
      approvedBy: '',
      approvedAt: null,
    });

    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const deleteGalleryAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getAlbumById(id);

    if (!existing || existing.isDeleted) {
      return sendError(res, 404, 'Album not found');
    }

    if (existing.isDeleted) {
      return sendError(res, 400, 'Album is already deleted');
    }

    const deleted = await softDeleteAlbumById(id, req.user.username);

    if (!deleted) {
      return sendError(res, 404, 'Album not found');
    }

    sendSuccess(res, { data: deleted, message: 'Album moved to deleted items' });
  } catch (error) {
    next(error);
  }
};

export const approveGalleryAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await getAlbumById(id);
    if (!existing) {
      return sendError(res, 404, 'Album not found');
    }

    const updated = await approveAlbumById(id, req.user.username);
    sendSuccess(res, { data: updated, message: 'Album approved' });
  } catch (error) {
    next(error);
  }
};

export const rejectGalleryAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const existing = await getAlbumById(id);
    if (!existing) {
      return sendError(res, 404, 'Album not found');
    }

    const updated = await rejectAlbumById(id, req.user.username, rejectionReason || '');
    sendSuccess(res, { data: updated, message: 'Album rejected' });
  } catch (error) {
    next(error);
  }
};

export const restoreGalleryAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getAlbumById(id);

    if (!existing) {
      return sendError(res, 404, 'Album not found');
    }

    if (!existing.isDeleted) {
      return sendError(res, 400, 'Album is not deleted');
    }

    const restored = await restoreAlbumById(id, req.user.username);
    sendSuccess(res, { data: restored, message: 'Album restored' });
  } catch (error) {
    next(error);
  }
};

export const permanentlyDeleteGalleryAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getAlbumById(id);

    if (!existing) {
      return sendError(res, 404, 'Album not found');
    }

    if (!existing.isDeleted) {
      return sendError(res, 400, 'Only deleted albums can be permanently removed');
    }

    await permanentlyDeleteAlbumById(id);
    sendSuccess(res, { message: 'Album permanently deleted' });
  } catch (error) {
    next(error);
  }
};

export const getAdminGalleryImages = async (req, res, next) => {
  try {
    const { albumId } = req.params;
    const deletedOnly = String(req.query.deletedOnly || '').toLowerCase() === 'true';
    const includeDeleted = String(req.query.includeDeleted || '').toLowerCase() === 'true';
    
    const album = await getAlbumById(albumId);
    if (!album || album.isDeleted) {
      return sendError(res, 404, 'Album not found');
    }

    const data = await listAdminImagesByAlbum(albumId, { deletedOnly, includeDeleted });
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const createGalleryImage = async (req, res, next) => {
  try {
    const { albumId } = req.params;
    const album = await getAlbumById(albumId);

    if (!album || album.isDeleted) {
      return sendError(res, 404, 'Album not found');
    }

    const payload = {
      ...req.body,
      gallery: albumId,
      createdBy: req.user.username,
      updatedBy: req.user.username,
      approved: false,
      approvedBy: '',
      approvedAt: null,
    };

    const data = await addImageToAlbum(payload);
    sendCreated(res, { data });
  } catch (error) {
    next(error);
  }
};

export const updateGalleryImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getImageById(id);

    if (!existing || existing.isDeleted) {
      return sendError(res, 404, 'Gallery image not found');
    }

    // Enter users can update only unapproved entries. Managers can update all.
    if (!canEditUnapproved(req.user, FUNCTION_NAME, existing.approved)) {
      return sendError(res, 403, 'Forbidden: You cannot edit this image');
    }

    const data = await updateImageById(id, {
      ...req.body,
      updatedBy: req.user.username,
      // Any update requires re-approval to keep publishing workflow safe.
      approved: false,
      approvedBy: '',
      approvedAt: null,
    });

    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const deleteGalleryImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getImageById(id);

    if (!existing || existing.isDeleted) {
      return sendError(res, 404, 'Gallery image not found');
    }

    const deleted = await softDeleteImageById(id, req.user.username);

    if (!deleted) {
      return sendError(res, 404, 'Gallery image not found');
    }

    sendSuccess(res, { data: deleted, message: 'Gallery image moved to deleted items' });
  } catch (error) {
    next(error);
  }
};

export const approveGalleryImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await getImageById(id);
    if (!existing) {
      return sendError(res, 404, 'Gallery image not found');
    }

    const updated = await approveImageById(id, req.user.username);
    sendSuccess(res, { data: updated, message: 'Gallery image approved' });
  } catch (error) {
    next(error);
  }
};

export const rejectGalleryImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const existing = await getImageById(id);
    if (!existing) {
      return sendError(res, 404, 'Gallery image not found');
    }

    const updated = await rejectImageById(id, req.user.username, rejectionReason || '');
    sendSuccess(res, { data: updated, message: 'Gallery image rejected' });
  } catch (error) {
    next(error);
  }
};

export const restoreGalleryImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getImageById(id);

    if (!existing) {
      return sendError(res, 404, 'Gallery image not found');
    }

    if (!existing.isDeleted) {
      return sendError(res, 400, 'Gallery image is not deleted');
    }

    const restored = await restoreImageById(id, req.user.username);
    sendSuccess(res, { data: restored, message: 'Gallery image restored' });
  } catch (error) {
    next(error);
  }
};

export const permanentlyDeleteGalleryImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getImageById(id);

    if (!existing) {
      return sendError(res, 404, 'Gallery image not found');
    }

    if (!existing.isDeleted) {
      return sendError(res, 400, 'Only deleted gallery images can be permanently removed');
    }

    await permanentlyDeleteImageById(id);
    sendSuccess(res, { message: 'Gallery image permanently deleted' });
  } catch (error) {
    next(error);
  }
};
