import express from 'express';
import { z } from 'zod';

import validateRequest from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/rbacMiddleware.js';
import {
  createPersonalEvent,
  deletePersonalEvent,
  getPersonalEvents,
  getPersonalEventsByRange,
  updatePersonalEvent,
} from '../controllers/personalEvents.controller.js';

const router = express.Router();

const personalEventBodySchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  eventDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
});

const createPersonalEventSchema = z.object({
  body: personalEventBodySchema,
  params: z.object({}),
  query: z.object({}),
});

const updatePersonalEventSchema = z.object({
  body: personalEventBodySchema.partial(),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}),
});

router.get('/', authenticate, getPersonalEvents);
router.get('/range', authenticate, getPersonalEventsByRange);
router.post('/', authenticate, validateRequest(createPersonalEventSchema), createPersonalEvent);
router.put('/:id', authenticate, validateRequest(updatePersonalEventSchema), updatePersonalEvent);
router.delete('/:id', authenticate, deletePersonalEvent);

export default router;
