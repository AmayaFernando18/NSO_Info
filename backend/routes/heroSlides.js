import express from 'express';
import { z } from 'zod';

import validateRequest from '../middleware/validateRequest.js';
import uploadHero from '../middleware/uploadHero.js';
import { authenticate, requireAction } from '../middleware/rbacMiddleware.js';
import { RBAC_FUNCTION } from '../config/rbacFunctions.js';
import {
  approveHeroSlide,
  createHeroSlide,
  getAdminHeroSlides,
  getPublicHeroSlides,
  permanentlyDeleteHeroSlide,
  rejectHeroSlide,
  removeHeroSlide,
  reorderHeroSlidesController,
  restoreHeroSlide,
  updateHeroSlide,
} from '../controllers/heroSlides.controller.js';

const router = express.Router();
const FUNCTION_NAME = RBAC_FUNCTION.HERO;

const heroBodySchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  imageUrl: z.string().min(2),
  order: z.number().int().min(1),
  activeStatus: z.boolean().optional(),
});

const createSchema = z.object({
  body: heroBodySchema,
  params: z.object({}),
  query: z.object({}),
});

const updateSchema = z.object({
  body: heroBodySchema.partial(),
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

router.get('/public', getPublicHeroSlides);
router.get('/', authenticate, requireAction('view', FUNCTION_NAME), getAdminHeroSlides);
router.post('/', authenticate, requireAction('create', FUNCTION_NAME), validateRequest(createSchema), createHeroSlide);
router.put('/:id', authenticate, requireAction('edit', FUNCTION_NAME), validateRequest(updateSchema), updateHeroSlide);
router.delete('/:id', authenticate, requireAction('delete', FUNCTION_NAME), removeHeroSlide);
router.patch('/:id/restore', authenticate, requireAction('delete', FUNCTION_NAME), restoreHeroSlide);
router.delete('/:id/permanent', authenticate, requireAction('delete', FUNCTION_NAME), permanentlyDeleteHeroSlide);
router.patch('/reorder', authenticate, requireAction('edit', FUNCTION_NAME), validateRequest(reorderSchema), reorderHeroSlidesController);

// Approve and reject endpoints enforce RBAC authority 'approve' (only A and M roles).
// These gates ensure only designated approvers (managers or admins) can control what content
// appears on the public carousel, maintaining content quality and consistency across the platform.
router.patch('/:id/approve', authenticate, requireAction('approve', FUNCTION_NAME), approveHeroSlide);
router.patch('/:id/reject', authenticate, requireAction('approve', FUNCTION_NAME), validateRequest(rejectSchema), rejectHeroSlide);

router.post(
  '/upload',
  authenticate,
  requireAction('create', FUNCTION_NAME),
  uploadHero.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Persist only a relative path; frontend resolves host from API base URL.
    const imageUrl = `/uploads/hero/${req.file.filename}`;
    res.json({ success: true, data: { imageUrl } });
  }
);

export default router;
