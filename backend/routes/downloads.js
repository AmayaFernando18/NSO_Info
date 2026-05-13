import express from 'express';
import { z } from 'zod';
import validateRequest from '../middleware/validateRequest.js';
import { authenticate, requireAction } from '../middleware/rbacMiddleware.js';
import { RBAC_FUNCTION } from '../config/rbacFunctions.js';
import { createUploadMiddleware, buildUploadPublicPath } from '../middleware/upload.js';
import { UPLOAD_POLICY_KEYS } from '../config/uploadPolicies.js';
import {
  createDownload,
  deleteDownload,
  getAdminDownloads,
  approveDownload,
  getDownload,
  getPublicDownloads,
  rejectDownload,
  updateDownload,
  getDeletedDownloads,
  restoreDownload,
  permanentlyDeleteDownload,
} from '../controllers/downloads.controller.js';

const router = express.Router();
const FUNCTION_NAME = RBAC_FUNCTION.DOWNLOADS;
const uploadDownloads = createUploadMiddleware({ subdirectory: 'downloads', policyKey: UPLOAD_POLICY_KEYS.DOWNLOAD_PDF });

router.post(
  '/upload',
  authenticate,
  requireAction('create', FUNCTION_NAME),
  uploadDownloads.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = buildUploadPublicPath('downloads', req.file.filename);
    res.json({ success: true, data: { fileUrl } });
  }
);

const downloadBodySchema = z.object({
  category: z.string().trim().min(2, 'Category must be at least 2 characters'),
  title: z.string().trim().min(2, 'Title must be at least 2 characters'),
  language: z.string().trim().min(2, 'Language must be at least 2 characters'),
  fileUrl: z.string().trim().min(1, 'PDF file is required'),
  activeStatus: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

const createDownloadSchema = z.object({
  body: downloadBodySchema,
  params: z.object({}),
  query: z.object({}),
});

const updateDownloadSchema = z.object({
  body: downloadBodySchema.partial(),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}),
});

router.get('/public', getPublicDownloads);
router.get('/public/:id', getDownload);
router.get('/admin', authenticate, requireAction('view', FUNCTION_NAME), getAdminDownloads);
router.get('/admin/:id', authenticate, requireAction('view', FUNCTION_NAME), getDownload);
router.post('/admin', authenticate, requireAction('create', FUNCTION_NAME), validateRequest(createDownloadSchema), createDownload);
router.put('/admin/:id', authenticate, requireAction('edit', FUNCTION_NAME), validateRequest(updateDownloadSchema), updateDownload);
router.patch('/admin/:id/approve', authenticate, requireAction('approve', FUNCTION_NAME), approveDownload);
router.patch('/admin/:id/reject', authenticate, requireAction('approve', FUNCTION_NAME), rejectDownload);
router.delete('/admin/:id', authenticate, requireAction('delete', FUNCTION_NAME), deleteDownload);

/**
 * @swagger
 * /api/downloads/deleted:
 *   get:
 *     summary: Retrieve a list of deleted downloads (Admin only)
 *     tags: [Downloads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of deleted downloads retrieved successfully
 */
router.get('/deleted/all', authenticate, requireAction('view', FUNCTION_NAME), getDeletedDownloads);

/**
 * @swagger
 * /api/downloads/deleted/{id}/restore:
 *   patch:
 *     summary: Restore a conditionally deleted download by ID
 *     tags: [Downloads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Download item restored
 */
router.patch('/deleted/:id/restore', authenticate, requireAction('delete', FUNCTION_NAME), restoreDownload);

/**
 * @swagger
 * /api/downloads/deleted/{id}/permanent:
 *   delete:
 *     summary: Permanently delete a download item and its associated file
 *     tags: [Downloads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Download item permanently deleted
 */
router.delete('/deleted/:id/permanent', authenticate, requireAction('delete', FUNCTION_NAME), permanentlyDeleteDownload);

export default router;