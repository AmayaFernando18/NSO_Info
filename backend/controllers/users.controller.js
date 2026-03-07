import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * GET /users/:epf
 * Get user by EPF number (username)
 */
export const getUserByEPF = async (req, res, next) => {
  try {
    const { epf } = req.params;
    const user = await User.findOne({ username: epf }, { __v: 0 });

    if (!user) {
      return sendError(res, 404, 'User not assigned in RBAC DB');
    }

    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /users/assign
 * Assign or update a user's access (function-based RBAC, superadmin only)
 */
export const assignUserAccess = async (req, res, next) => {
  try {
    const { username, isSuperAdmin = false, functionPermissions = [] } = req.body || {};

    if (!username) {
      return sendError(res, 400, 'username is required');
    }

    // Sanitize function permissions
    const sanitized = Array.isArray(functionPermissions)
      ? functionPermissions
          .filter((p) => p && p.function && p.authority)
          .map((p) => ({ function: String(p.function), authority: String(p.authority) }))
      : [];

    if (!isSuperAdmin && sanitized.length === 0) {
      return sendError(res, 400, 'Provide at least one function permission or set isSuperAdmin');
    }

    const payload = {
      username,
      isSuperAdmin: Boolean(isSuperAdmin),
      functionPermissions: Boolean(isSuperAdmin) ? [] : sanitized,
    };

    const user = await User.findOneAndUpdate({ username }, payload, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    sendSuccess(res, { message: 'Access saved', user });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /users/all
 * List all assigned users (superadmin only)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, { __v: 0 }).sort({ username: 1 });
    sendSuccess(res, { users });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /users/:epf
 * Delete a user's role assignment (superadmin only)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { epf } = req.params;
    const user = await User.findOneAndDelete({ username: epf });

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendSuccess(res, { message: 'User role deleted', username: epf });
  } catch (error) {
    next(error);
  }
};
