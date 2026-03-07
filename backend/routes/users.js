import express from 'express';
import { z } from 'zod';

import validateRequest from '../middleware/validateRequest.js';
import { authenticate, requireSuperAdmin } from '../middleware/rbacMiddleware.js';
import { getUserByEPF, assignUserAccess, getAllUsers, deleteUser } from '../controllers/users.controller.js';
import { RBAC_FUNCTIONS } from '../config/rbacFunctions.js';

const router = express.Router();

// Schema for assigning user access
const assignAccessSchema = z.object({
  body: z.object({
    username: z.string().min(2),
    isSuperAdmin: z.boolean().optional(),
    functionPermissions: z
      .array(
        z.object({
          // Pull allowed functions from shared config to keep admin assignment
          // in sync with backend authorization checks.
          function: z.enum(RBAC_FUNCTIONS),
          authority: z.enum(['E', 'C', 'A', 'M']),
        })
      )
      .optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

/**
 * @openapi
 * /users/assign:
 *   post:
 *     summary: Assign User Access
 *     description: Assign or update user's RBAC permissions (SuperAdmin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 example: "123456"
 *               isSuperAdmin:
 *                 type: boolean
 *                 example: false
 *               functionPermissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     function:
 *                       type: string
 *                       enum: [News, Hero]
 *                     authority:
 *                       type: string
 *                       enum: [E, C, A, M]
 *                   required:
 *                     - function
 *                     - authority
 *     responses:
 *       200:
 *         description: Access saved
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Forbidden - SuperAdmin required
 */
router.post('/assign', authenticate, requireSuperAdmin, validateRequest(assignAccessSchema), assignUserAccess);

/**
 * @openapi
 * /users/all:
 *   get:
 *     summary: List All Users
 *     description: Get all users with RBAC assignments (SuperAdmin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden - SuperAdmin required
 */
router.get('/all', authenticate, requireSuperAdmin, getAllUsers);

/**
 * @openapi
 * /users/{epf}:
 *   get:
 *     summary: Get User by EPF
 *     description: Get user RBAC details by EPF number (username). This endpoint doesn't require authentication.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: epf
 *         required: true
 *         schema:
 *           type: string
 *         description: EPF number (username)
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       404:
 *         description: User not found in RBAC DB
 */
router.get('/:epf', getUserByEPF);

/**
 * @openapi
 * /users/{epf}:
 *   delete:
 *     summary: Delete User Access
 *     description: Delete user's RBAC assignment (SuperAdmin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: epf
 *         required: true
 *         schema:
 *           type: string
 *         description: EPF number (username)
 *     responses:
 *       200:
 *         description: User role deleted
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden - SuperAdmin required
 */
router.delete('/:epf', authenticate, requireSuperAdmin, deleteUser);

export default router;
