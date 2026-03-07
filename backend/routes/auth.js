import express from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

import validateRequest from '../middleware/validateRequest.js';
import { login, checkAvailability, getMe } from '../controllers/auth.controller.js';

const router = express.Router();

// Login schema for AD authentication
const loginSchema = z.object({
  body: z.object({
    ad_user_name: z.string().min(2),
    ad_password: z.string().min(1),
  }),
  params: z.object({}),
  query: z.object({}),
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: AD Login
 *     description: Authenticates a user via Active Directory and returns a JWT token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ad_user_name
 *               - ad_password
 *             properties:
 *               ad_user_name:
 *                 type: string
 *                 example: "123456"
 *               ad_password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthLoginResponse'
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validateRequest(loginSchema), login);

/**
 * @openapi
 * /auth/check-availability:
 *   get:
 *     summary: Check AD User Availability
 *     description: Checks if a user exists in Active Directory
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: user_name
 *         required: true
 *         schema:
 *           type: string
 *         description: Username to check
 *     responses:
 *       200:
 *         description: User availability check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 IsSuccess:
 *                   type: boolean
 *       400:
 *         description: Username not provided
 */
router.get('/check-availability', checkAvailability);

/**
 * Middleware to verify JWT token
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.tokenUser = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get Current User
 *     description: Get current user data from JWT token
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/me', verifyToken, getMe);

export default router;
