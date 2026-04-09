import express from 'express';
import { z } from 'zod';

import validateRequest from '../middleware/validateRequest.js';
import { authenticate, requireAction } from '../middleware/rbacMiddleware.js';
import { RBAC_FUNCTION } from '../config/rbacFunctions.js';
import {
  approveQuickAccess,
  createQuickAccess,
  deleteQuickAccess,
  getAdminQuickAccess,
  getPublicQuickAccess,
  permanentlyDeleteQuickAccess,
  rejectQuickAccess,
  reorderQuickAccessController,
  restoreQuickAccess,
  updateQuickAccess,
} from '../controllers/quickAccess.controller.js';

const router = express.Router();
const FUNCTION_NAME = RBAC_FUNCTION.QUICK_ACCESS;

const quickAccessBodySchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  url: z.string().min(1),
  icon: z.string().min(1),
  order: z.number().int().min(1),
  activeStatus: z.boolean().optional(),
});

const createSchema = z.object({
  body: quickAccessBodySchema,
  params: z.object({}),
  query: z.object({}),
});

const updateSchema = z.object({
  body: quickAccessBodySchema.partial(),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}),
});

const reorderSchema = z.object({
  body: z.object({
    orderedIds: z.array(z.string().min(1)).min(1),
  }),
  params: z.object({}),
  query: z.object({}),
});

const rejectSchema = z.object({
  body: z.object({
    rejectionReason: z.string().optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}),
});

/**
 * @openapi
 * /quick-access/public:
 *   get:
 *     summary: List Public Quick Access Links
 *     description: Returns active, approved quick access links ordered for home page display.
 *     tags:
 *       - QuickAccess
 *     responses:
 *       200:
 *         description: Quick access list
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
 *                         $ref: '#/components/schemas/QuickAccess'
 */
router.get('/public', getPublicQuickAccess);

/**
 * @openapi
 * /quick-access:
 *   get:
 *     summary: List Quick Access Links (Admin)
 *     description: Returns quick access links for admin management.
 *     tags:
 *       - QuickAccess
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quick access list
 *
 *   post:
 *     summary: Create Quick Access Link
 *     description: Create a quick access link (requires create permission for QuickAccess function).
 *     tags:
 *       - QuickAccess
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Quick access item created
 */
router.get('/', authenticate, requireAction('view', FUNCTION_NAME), getAdminQuickAccess);
router.post('/', authenticate, requireAction('create', FUNCTION_NAME), validateRequest(createSchema), createQuickAccess);

/**
 * @openapi
 * /quick-access/{id}:
 *   put:
 *     summary: Update Quick Access Link
 *     description: Update quick access link. Enter users can edit only unapproved items.
 *     tags:
 *       - QuickAccess
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
 *         description: Quick access item updated
 *
 *   delete:
 *     summary: Delete Quick Access Link
 *     description: Soft-delete a quick access link (requires delete permission for QuickAccess function).
 *     tags:
 *       - QuickAccess
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
 *         description: Quick access item moved to deleted list
 */
router.put('/:id', authenticate, requireAction('edit', FUNCTION_NAME), validateRequest(updateSchema), updateQuickAccess);
router.delete('/:id', authenticate, requireAction('delete', FUNCTION_NAME), deleteQuickAccess);

/**
 * @openapi
 * /quick-access/reorder:
 *   patch:
 *     summary: Reorder Quick Access Links
 *     description: Update display order by passing ordered IDs.
 *     tags:
 *       - QuickAccess
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quick access order updated
 *
 * /quick-access/{id}/approve:
 *   patch:
 *     summary: Approve Quick Access Link
 *     description: Approve a pending quick access item (requires approve permission for QuickAccess function).
 *     tags:
 *       - QuickAccess
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
 *         description: Quick access item approved
 *
 * /quick-access/{id}/reject:
 *   patch:
 *     summary: Reject Quick Access Link
 *     description: Reject a pending quick access item with reason (requires approve permission for QuickAccess function).
 *     tags:
 *       - QuickAccess
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
 *         description: Quick access item rejected
 */
router.patch('/:id/restore', authenticate, requireAction('delete', FUNCTION_NAME), restoreQuickAccess);
router.delete('/:id/permanent', authenticate, requireAction('delete', FUNCTION_NAME), permanentlyDeleteQuickAccess);
router.patch('/reorder', authenticate, requireAction('edit', FUNCTION_NAME), validateRequest(reorderSchema), reorderQuickAccessController);
router.patch('/:id/approve', authenticate, requireAction('approve', FUNCTION_NAME), approveQuickAccess);
router.patch('/:id/reject', authenticate, requireAction('approve', FUNCTION_NAME), validateRequest(rejectSchema), rejectQuickAccess);

export default router;
