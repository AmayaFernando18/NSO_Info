import express from 'express';
import { z } from 'zod';
import upload from '../middleware/upload.js';

import validateRequest from '../middleware/validateRequest.js';
import { authenticate, requireAction } from '../middleware/rbacMiddleware.js';
import { RBAC_FUNCTION } from '../config/rbacFunctions.js';
import {
  approveNews,
  createNews,
  deleteNews,
  getAdminNews,
  getPublicNews,
  updateNews,
  rejectNews,
  restoreNews,
  permanentlyDeleteNews,
} from '../controllers/news.controller.js';

const router = express.Router();
const FUNCTION_NAME = RBAC_FUNCTION.NEWS;

/**
 * @openapi
 * /news/upload:
 *   post:
 *     summary: Upload News Image
 *     description: Upload an image for a news article
 *     tags:
 *       - News
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 */
router.post(
  '/upload',
  authenticate,
  requireAction('create', FUNCTION_NAME),
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Persist only a relative path; frontend resolves host from API base URL.
    const imageUrl = `/uploads/news/${req.file.filename}`;
    res.json({ success: true, data: { imageUrl } });
  }
);

const newsBodySchema = z.object({
  title: z.string().min(2),
  summary: z.string().min(2),
  content: z.string().min(2),
  category: z.string().min(2),
  imageUrl: z.string().optional(),
  activeStatus: z.boolean().optional(),
  publishedAt: z.coerce.date().optional(),
});

const createNewsSchema = z.object({
  body: newsBodySchema,
  params: z.object({}),
  query: z.object({}),
});

const updateNewsSchema = z.object({
  body: newsBodySchema.partial(),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}),
});

/**
 * @openapi
 * /news/public:
 *   get:
 *     summary: List Public News
 *     description: Returns only active and approved news items for user-facing pages.
 *     tags:
 *       - News
 *     responses:
 *       200:
 *         description: Public news list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/News'
 */
router.get('/public', getPublicNews);

/**
 * @openapi
 * /news:
 *   get:
 *     summary: List All News (Admin)
 *     description: Returns all news records (approved and pending).
 *     tags:
 *       - News
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: News list
 *
 *   post:
 *     summary: Create News
 *     description: Create a news item (requires create permission for News function).
 *     tags:
 *       - News
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: News item created
 */
router.get('/', authenticate, requireAction('view', FUNCTION_NAME), getAdminNews);
router.post('/', authenticate, requireAction('create', FUNCTION_NAME), validateRequest(createNewsSchema), createNews);

/**
 * @openapi
 * /news/{id}:
 *   put:
 *     summary: Update News
 *     description: Update news item. Enter users can edit only unapproved items.
 *     tags:
 *       - News
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
 *         description: News item updated
 *
 *   delete:
 *     summary: Delete News
 *     description: Delete news item (requires delete permission for News function).
 *     tags:
 *       - News
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
 *         description: News item deleted
 */
router.put('/:id', authenticate, requireAction('edit', FUNCTION_NAME), validateRequest(updateNewsSchema), updateNews);
router.delete('/:id', authenticate, requireAction('delete', FUNCTION_NAME), deleteNews);
router.patch('/:id/restore', authenticate, requireAction('delete', FUNCTION_NAME), restoreNews);
router.delete('/:id/permanent', authenticate, requireAction('delete', FUNCTION_NAME), permanentlyDeleteNews);

/**
 * @openapi
 * /news/{id}/approve:
 *   patch:
 *     summary: Approve News
 *     description: Approve a pending news item (requires approve permission for News function).
 *     tags:
 *       - News
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
 *         description: News item approved
 */
router.patch('/:id/approve', authenticate, requireAction('approve', FUNCTION_NAME), approveNews);

/**
 * @openapi
 * /news/{id}/reject:
 *   patch:
 *     summary: Reject News
 *     description: Reject a pending news item with a reason (requires approve permission for News function).
 *     tags:
 *       - News
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: News item rejected
 */
router.patch('/:id/reject', authenticate, requireAction('approve', FUNCTION_NAME), rejectNews);

export default router;
