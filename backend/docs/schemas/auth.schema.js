/**
 * @openapi
 * components:
 *   schemas:
 *     AuthLoginResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiSuccess'
 *         - type: object
 *           properties:
 *             token:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             user:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: "123456"
 *                 isSuperAdmin:
 *                   type: boolean
 *                   example: false
 *                 functionPermissions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       function:
 *                         type: string
 *                         enum: [News, Hero]
 *                       authority:
 *                         type: string
 *                         enum: [E, C, A, M]
 *                   example:
 *                     - function: News
 *                       authority: M
 *                     - function: Hero
 *                       authority: E
 *                 displayName:
 *                   type: string
 *                   example: "Mr. John Doe"
 *                 email:
 *                   type: string
 *                   example: "john.doe@ceb.lk"
 *                 accessInfo:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       example: "User"
 *                     description:
 *                       type: string
 *                       example: "Function-based access"
 *                     functions:
 *                       type: array
 *             message:
 *               type: string
 *               example: "Login successful"
 *           required:
 *             - token
 *             - user
 *     User:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           example: "123456"
 *         isSuperAdmin:
 *           type: boolean
 *           example: false
 *         functionPermissions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               function:
 *                 type: string
 *                 enum: [News, Hero]
 *               authority:
 *                 type: string
 *                 enum: [E, C, A, M]
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiSuccess'
 *         - type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
