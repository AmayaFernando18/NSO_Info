import express from 'express';
import { z } from 'zod';
import uploadGallery from '../middleware/uploadGallery.js';
import validateRequest from '../middleware/validateRequest.js';
import { authenticate, requireAction } from '../middleware/rbacMiddleware.js';
import { RBAC_FUNCTION } from '../config/rbacFunctions.js';
import {
  approveGalleryAlbum,
  approveGalleryImage,
  createGalleryAlbum,
  createGalleryImage,
  deleteGalleryAlbum,
  deleteGalleryImage,
  getAdminGalleryAlbums,
  getAdminGalleryImages,
  getPublicGalleryAlbumDetail,
  getPublicGalleryAlbums,
  permanentlyDeleteGalleryAlbum,
  permanentlyDeleteGalleryImage,
  rejectGalleryAlbum,
  rejectGalleryImage,
  restoreGalleryAlbum,
  restoreGalleryImage,
  updateGalleryAlbum,
  updateGalleryImage,
} from '../controllers/gallery.controller.js';

const router = express.Router();
const FUNCTION_NAME = RBAC_FUNCTION.GALLERY;

router.post(
  '/upload',
  authenticate,
  requireAction('create', FUNCTION_NAME),
  uploadGallery.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const imageUrl = `/uploads/gallery/${req.file.filename}`;
    res.json({ success: true, data: { imageUrl } });
  }
);

const albumBodySchema = z.object({
  name: z.string().trim().min(2, 'Album name must be at least 2 characters'),
  description: z.string().trim().optional(),
  coverImageUrl: z.string().trim().optional(),
  displayOrder: z.number().int().min(0).optional(),
  activeStatus: z.boolean().optional(),
});

const imageBodySchema = z.object({
  title: z.string().trim().optional(),
  altText: z.string().trim().optional(),
  imageUrl: z.string().trim().min(1, 'Image URL is required'),
  displayOrder: z.number().int().min(0).optional(),
  activeStatus: z.boolean().optional(),
});

const createAlbumSchema = z.object({
  body: albumBodySchema,
  params: z.object({}),
  query: z.object({}),
});

const updateAlbumSchema = z.object({
  body: albumBodySchema.partial(),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}),
});

const createImageSchema = z.object({
  body: imageBodySchema,
  params: z.object({ albumId: z.string().min(1) }),
  query: z.object({}),
});

const updateImageSchema = z.object({
  body: imageBodySchema.partial(),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}),
});

const rejectSchema = z.object({
  body: z.object({ rejectionReason: z.string().optional() }),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}),
});

router.get('/public/albums', getPublicGalleryAlbums);
router.get('/public/albums/:id', getPublicGalleryAlbumDetail);

router.get('/admin/albums', authenticate, requireAction('view', FUNCTION_NAME), getAdminGalleryAlbums);
router.post(
  '/admin/albums',
  authenticate,
  requireAction('create', FUNCTION_NAME),
  validateRequest(createAlbumSchema),
  createGalleryAlbum
);
router.put(
  '/admin/albums/:id',
  authenticate,
  requireAction('edit', FUNCTION_NAME),
  validateRequest(updateAlbumSchema),
  updateGalleryAlbum
);
router.delete('/admin/albums/:id', authenticate, requireAction('delete', FUNCTION_NAME), deleteGalleryAlbum);

router.get('/admin/albums/:albumId/images', authenticate, requireAction('view', FUNCTION_NAME), getAdminGalleryImages);
router.post(
  '/admin/albums/:albumId/images',
  authenticate,
  requireAction('create', FUNCTION_NAME),
  validateRequest(createImageSchema),
  createGalleryImage
);
router.put(
  '/admin/images/:id',
  authenticate,
  requireAction('edit', FUNCTION_NAME),
  validateRequest(updateImageSchema),
  updateGalleryImage
);
router.delete('/admin/images/:id', authenticate, requireAction('delete', FUNCTION_NAME), deleteGalleryImage);

// Album approval and workflow routes
router.post('/admin/albums/:id/approve', authenticate, requireAction('approve', FUNCTION_NAME), approveGalleryAlbum);
router.post(
  '/admin/albums/:id/reject',
  authenticate,
  requireAction('approve', FUNCTION_NAME),
  validateRequest(rejectSchema),
  rejectGalleryAlbum
);
router.post('/admin/albums/:id/restore', authenticate, requireAction('delete', FUNCTION_NAME), restoreGalleryAlbum);
router.delete(
  '/admin/albums/:id/permanent',
  authenticate,
  requireAction('delete', FUNCTION_NAME),
  permanentlyDeleteGalleryAlbum
);

// Image approval and workflow routes
router.post('/admin/images/:id/approve', authenticate, requireAction('approve', FUNCTION_NAME), approveGalleryImage);
router.post(
  '/admin/images/:id/reject',
  authenticate,
  requireAction('approve', FUNCTION_NAME),
  validateRequest(rejectSchema),
  rejectGalleryImage
);
router.post('/admin/images/:id/restore', authenticate, requireAction('delete', FUNCTION_NAME), restoreGalleryImage);
router.delete(
  '/admin/images/:id/permanent',
  authenticate,
  requireAction('delete', FUNCTION_NAME),
  permanentlyDeleteGalleryImage
);

export default router;
