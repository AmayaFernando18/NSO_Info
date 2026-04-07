import {
  addAlbum,
  addImageToAlbum,
  deleteAlbumById,
  deleteImageById,
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
    const data = await listAdminAlbums();
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

    const data = await updateAlbumById(id, {
      ...req.body,
      updatedBy: req.user.username,
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

    await deleteAlbumById(id);
    sendSuccess(res, { message: 'Album deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAdminGalleryImages = async (req, res, next) => {
  try {
    const { albumId } = req.params;
    const album = await getAlbumById(albumId);
    if (!album || album.isDeleted) {
      return sendError(res, 404, 'Album not found');
    }

    const data = await listAdminImagesByAlbum(albumId);
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

    if (!existing) {
      return sendError(res, 404, 'Gallery image not found');
    }

    const data = await updateImageById(id, {
      ...req.body,
      updatedBy: req.user.username,
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

    if (!existing) {
      return sendError(res, 404, 'Gallery image not found');
    }

    await deleteImageById(id);
    sendSuccess(res, { message: 'Gallery image deleted successfully' });
  } catch (error) {
    next(error);
  }
};
