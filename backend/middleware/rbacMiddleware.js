import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../config/logger.js';
import { hasAuthorityForFunction, canPerformAction } from '../utils/rbacHelpers.js';

/**
 * Middleware to verify JWT token and attach user to request
 * JWT-only authentication (Authorization: Bearer <token>)
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const username = decoded.username;

        // Fetch user from database to get latest RBAC permissions
        const dbUser = await User.findOne({ username });

        if (dbUser) {
          // Update last login timestamp
          dbUser.lastLogin = new Date();
          await dbUser.save();

          req.user = {
            username: dbUser.username,
            isSuperAdmin: dbUser.isSuperAdmin,
            functionPermissions: dbUser.functionPermissions || [],
            displayName: decoded.displayName || username,
          };
        } else {
          // User authenticated but not in RBAC DB - allow with no permissions
          req.user = {
            username,
            isSuperAdmin: false,
            functionPermissions: [],
            displayName: decoded.displayName || username,
          };
        }

        return next();
      } catch (error) {
        logger.error('JWT verification failed:', error.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    }

    return res.status(401).json({ error: 'Unauthorized: Bearer token required' });
  } catch (err) {
    logger.error('Authentication middleware error:', err);
    res.status(500).json({ error: 'Server error during authentication' });
  }
};

/**
 * Check if user is SuperAdmin
 * @param {Object} user - User object from request
 * @returns {boolean}
 */
export const isSuperAdmin = (user) => {
  return user?.isSuperAdmin === true;
};

/**
 * Middleware to require SuperAdmin access
 * Returns 403 if not SuperAdmin
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!isSuperAdmin(req.user)) {
    return res.status(403).json({ error: 'Forbidden: SuperAdmin access required' });
  }
  next();
};

/**
 * Middleware factory to require specific authority for a function
 * @param {string} requiredAuthority - Required authority level (E, C, A, M)
 * @param {string|Function} func - Function name or function to get function from request
 * @returns {Function} - Middleware function
 */
export const requireAuthority = (requiredAuthority, func) => {
  return (req, res, next) => {
    // Get function name - either static string or from function
    const functionName = typeof func === 'function' ? func(req) : func;

    if (!functionName) {
      return res.status(400).json({ error: 'Function not specified' });
    }

    // Check if user has required authority for this function
    if (!hasAuthorityForFunction(req.user, requiredAuthority, functionName)) {
      return res.status(403).json({
        error: `Forbidden: Required authority '${requiredAuthority}' for function '${functionName}'`,
      });
    }

    next();
  };
};

/**
 * Middleware factory to require ability to perform an action
 * @param {string} action - Action type (view, create, edit, delete, approve)
 * @param {string|Function} func - Function name or function to get function from request
 * @returns {Function} - Middleware function
 */
export const requireAction = (action, func) => {
  return (req, res, next) => {
    // Get function name
    const functionName = typeof func === 'function' ? func(req) : func;

    if (!functionName) {
      return res.status(400).json({ error: 'Function not specified' });
    }

    // Check if user can perform this action
    if (!canPerformAction(req.user, action, functionName)) {
      return res.status(403).json({
        error: `Forbidden: Cannot perform '${action}' action in function '${functionName}'`,
      });
    }

    next();
  };
};
