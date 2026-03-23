import express from 'express';
import { z } from 'zod';
import uploadCorporate from '../middleware/uploadCorporate.js';

import validateRequest from '../middleware/validateRequest.js';
import { authenticate, requireAction } from '../middleware/rbacMiddleware.js';
import { RBAC_FUNCTION } from '../config/rbacFunctions.js';
import {
  createMember,
  deleteMember,
  getAdminMembers,
  getPublicMembers,
  permanentlyDelete,
  reorderMembers,
  restoreMember,
  updateMember,
} from '../controllers/corporate.controller.js';
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  getPublicCategories,
  updateCategory,
} from '../controllers/corporateCategory.controller.js';

const router = express.Router();
const FUNCTION_NAME = RBAC_FUNCTION.CORPORATE;

/**
 * @openapi
 * /corporate/upload:
 *   post:
 *     summary: Upload Corporate Member Image
 *     description: Upload an image for a corporate member
 *     tags:
 *       - Corporate
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
  uploadCorporate.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const imageUrl = `/uploads/corporate/${req.file.filename}`;
    res.json({ success: true, data: { imageUrl } });
  }
);

const memberBodySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  position: z.string().trim().min(2, 'Position must be at least 2 characters'),
  department: z.string().trim().optional(),
  phone: z.string().trim().min(5, 'Phone must be at least 5 characters'),
  email: z.string().trim().email('Invalid email address'),
  imageUrl: z.string().trim().optional(),
  categoryId: z.string().trim().min(1, 'Category is required').optional(),
  activeStatus: z.boolean().optional(),
  displayOrder: z.number().int().min(0, 'Display order must be 0 or greater').optional(),
});

const createMemberBodySchema = memberBodySchema.extend({
  categoryId: z.string().trim().min(1, 'Category is required'),
});

const categoryBodySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters'),
  activeStatus: z.boolean().optional(),
  displayOrder: z.number().int().min(0, 'Display order must be 0 or greater').optional(),
});

// Request validation schemas - wrap body, params, query
const createMemberSchema = z.object({
  body: createMemberBodySchema,
  params: z.object({}),
  query: z.object({}),
});

const updateMemberSchema = z.object({
  body: memberBodySchema.partial(),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}),
});

const reorderMembersSchema = z.object({
  body: z.object({
    orderedIds: z.array(z.string().min(1)).min(1),
  }),
  params: z.object({}),
  query: z.object({}),
});

const createCategorySchema = z.object({
  body: categoryBodySchema,
  params: z.object({}),
  query: z.object({}),
});

const updateCategorySchema = z.object({
  body: categoryBodySchema.partial(),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}),
});

/**
 * @openapi
 * /corporate:
 *   get:
 *     summary: Get Public Corporate Members
 *     description: Get all active corporate members for public display
 *     tags:
 *       - Corporate
 *     responses:
 *       200:
 *         description: List of corporate members
 */
router.get('/', getPublicMembers);

router.get('/categories', getPublicCategories);

/**
 * @openapi
 * /corporate/admin/list:
 *   get:
 *     summary: Get Admin Corporate Members
 *     description: Get corporate members for admin view with filter options
 *     tags:
 *       - Corporate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: deletedOnly
 *         in: query
 *         schema:
 *           type: boolean
 *       - name: includeDeleted
 *         in: query
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of corporate members
 */
router.get('/admin/list', authenticate, requireAction('check', FUNCTION_NAME), getAdminMembers);

router.get(
  '/categories/admin',
  authenticate,
  requireAction('check', FUNCTION_NAME),
  getAdminCategories
);

router.post(
  '/categories/admin',
  authenticate,
  requireAction('create', FUNCTION_NAME),
  validateRequest(createCategorySchema),
  createCategory
);

router.put(
  '/categories/admin/:id',
  authenticate,
  requireAction('edit', FUNCTION_NAME),
  validateRequest(updateCategorySchema),
  updateCategory
);

router.delete(
  '/categories/admin/:id',
  authenticate,
  requireAction('delete', FUNCTION_NAME),
  deleteCategory
);

/**
 * @openapi
 * /corporate/admin:
 *   post:
 *     summary: Create Corporate Member
 *     description: Create a new corporate member
 *     tags:
 *       - Corporate
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - position
 *               - phone
 *               - email
 *     responses:
 *       201:
 *         description: Corporate member created
 */
router.post(
  '/admin',
  authenticate,
  requireAction('create', FUNCTION_NAME),
  validateRequest(createMemberSchema),
  createMember
);

router.patch(
  '/admin/reorder',
  authenticate,
  requireAction('edit', FUNCTION_NAME),
  validateRequest(reorderMembersSchema),
  reorderMembers
);

/**
 * @openapi
 * /corporate/admin/{id}:
 *   put:
 *     summary: Update Corporate Member
 *     description: Update an existing corporate member
 *     tags:
 *       - Corporate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Corporate member updated
 */
router.put(
  '/admin/:id',
  authenticate,
  requireAction('create', FUNCTION_NAME),
  validateRequest(updateMemberSchema),
  updateMember
);

/**
 * @openapi
 * /corporate/admin/{id}:
 *   delete:
 *     summary: Delete Corporate Member
 *     description: Soft delete a corporate member
 *     tags:
 *       - Corporate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Corporate member deleted
 */
router.delete(
  '/admin/:id',
  authenticate,
  requireAction('delete', FUNCTION_NAME),
  deleteMember
);

/**
 * @openapi
 * /corporate/admin/{id}/restore:
 *   put:
 *     summary: Restore Corporate Member
 *     description: Restore a deleted corporate member
 *     tags:
 *       - Corporate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Corporate member restored
 */
router.put(
  '/admin/:id/restore',
  authenticate,
  requireAction('delete', FUNCTION_NAME),
  restoreMember
);

/**
 * @openapi
 * /corporate/admin/{id}/permanent:
 *   delete:
 *     summary: Permanently Delete Corporate Member
 *     description: Permanently delete a corporate member from database
 *     tags:
 *       - Corporate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Corporate member permanently deleted
 */
router.delete(
  '/admin/:id/permanent',
  authenticate,
  requireAction('delete', FUNCTION_NAME),
  permanentlyDelete
);

export default router;
