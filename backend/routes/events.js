import express from 'express';
import { z } from 'zod';

import validateRequest from '../middleware/validateRequest.js';
import { authenticate, requireAction } from '../middleware/rbacMiddleware.js';
import { RBAC_FUNCTION } from '../config/rbacFunctions.js';
import {
  approveEvent,
  createEvent,
  deleteEvent,
  getAdminEvents,
  getPublicEvents,
  getUpcomingEvents,
  getEventsByDateRange,
  updateEvent,
  rejectEvent,
  restoreEvent,
  permanentlyDeleteEvent,
  getHolidays,
  getCalendarData,
} from '../controllers/events.controller.js';

const router = express.Router();
const FUNCTION_NAME = RBAC_FUNCTION.EVENTS;

const eventBodySchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  category: z.enum(['Meeting', 'Training', 'Workshop', 'Conference', 'Holiday', 'Special Day', 'Coordination', 'Drill', 'Other']),
  eventDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  linkLabel: z.string().optional(),
  linkUrl: z.string().url().optional().or(z.literal('')),
  isHoliday: z.boolean().optional(),
  isSpecialDay: z.boolean().optional(),
  activeStatus: z.boolean().optional(),
});

const createEventSchema = z.object({
  body: eventBodySchema,
  params: z.object({}),
  query: z.object({}),
});

const updateEventSchema = z.object({
  body: eventBodySchema.partial(),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}),
});

/**
 * @openapi
 * /events/public:
 *   get:
 *     summary: List Public Events
 *     description: Returns only active and approved events for user-facing pages.
 *     tags:
 *       - Events
 *     responses:
 *       200:
 *         description: Public events list
 */
router.get('/public', getPublicEvents);

/**
 * @openapi
 * /events/upcoming:
 *   get:
 *     summary: List Upcoming Events
 *     description: Returns upcoming approved events.
 *     tags:
 *       - Events
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *         description: Maximum number of events to return
 *     responses:
 *       200:
 *         description: Upcoming events list
 */
router.get('/upcoming', getUpcomingEvents);

/**
 * @openapi
 * /events/range:
 *   get:
 *     summary: Get Events by Date Range
 *     description: Returns events within a date range.
 *     tags:
 *       - Events
 *     parameters:
 *       - name: startDate
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Events within the date range
 */
router.get('/range', getEventsByDateRange);

/**
 * @openapi
 * /events/holidays:
 *   get:
 *     summary: Get Sri Lankan Holidays
 *     description: Returns Sri Lankan public holidays and special days.
 *     tags:
 *       - Events
 *     parameters:
 *       - name: year
 *         in: query
 *         schema:
 *           type: integer
 *         description: Year for holidays (default 2026)
 *     responses:
 *       200:
 *         description: List of holidays and special days
 */
router.get('/holidays', getHolidays);

/**
 * @openapi
 * /events/calendar:
 *   get:
 *     summary: Get Calendar Data
 *     description: Returns events, holidays, and special days for a specific month.
 *     tags:
 *       - Events
 *     parameters:
 *       - name: year
 *         in: query
 *         schema:
 *           type: integer
 *       - name: month
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Calendar data for the month
 */
router.get('/calendar', getCalendarData);

/**
 * @openapi
 * /events:
 *   get:
 *     summary: List All Events (Admin)
 *     description: Returns all events including pending approval (requires authentication).
 *     tags:
 *       - Events
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
 *         description: All events list
 */
router.get('/', authenticate, requireAction('view', FUNCTION_NAME), getAdminEvents);

/**
 * @openapi
 * /events:
 *   post:
 *     summary: Create Event
 *     description: Create a new event (requires create permission).
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               eventDate:
 *                 type: string
 *                 format: date
 *               linkLabel:
 *                 type: string
 *               linkUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event created successfully
 */
router.post(
  '/',
  authenticate,
  requireAction('create', FUNCTION_NAME),
  validateRequest(createEventSchema),
  createEvent
);

/**
 * @openapi
 * /events/{id}:
 *   put:
 *     summary: Update Event
 *     description: Update an existing event (requires edit permission).
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 */
router.put(
  '/:id',
  authenticate,
  requireAction('edit', FUNCTION_NAME),
  validateRequest(updateEventSchema),
  updateEvent
);

/**
 * @openapi
 * /events/{id}/approve:
 *   patch:
 *     summary: Approve Event
 *     description: Approve an event for public display (requires approve permission).
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event approved successfully
 */
router.patch('/:id/approve', authenticate, requireAction('approve', FUNCTION_NAME), approveEvent);

/**
 * @openapi
 * /events/{id}/reject:
 *   patch:
 *     summary: Reject Event
 *     description: Reject an event (requires approve permission).
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event rejected successfully
 */
router.patch('/:id/reject', authenticate, requireAction('approve', FUNCTION_NAME), rejectEvent);

/**
 * @openapi
 * /events/{id}:
 *   delete:
 *     summary: Soft Delete Event
 *     description: Move an event to deleted items (requires delete permission).
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event soft deleted successfully
 */
router.delete('/:id', authenticate, requireAction('delete', FUNCTION_NAME), deleteEvent);

/**
 * @openapi
 * /events/{id}/restore:
 *   patch:
 *     summary: Restore Event
 *     description: Restore a soft-deleted event (requires delete permission).
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event restored successfully
 */
router.patch('/:id/restore', authenticate, requireAction('delete', FUNCTION_NAME), restoreEvent);

/**
 * @openapi
 * /events/{id}/permanent:
 *   delete:
 *     summary: Permanently Delete Event
 *     description: Permanently remove a deleted event (requires delete permission).
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event permanently deleted
 */
router.delete('/:id/permanent', authenticate, requireAction('delete', FUNCTION_NAME), permanentlyDeleteEvent);

export default router;
