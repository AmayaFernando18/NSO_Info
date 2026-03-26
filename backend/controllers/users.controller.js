import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const AUTHORITY_RANK = {
  C: 1,
  E: 2,
  A: 3,
  M: 4,
};

const normalizeFunctionPermissions = (functionPermissions = []) => {
  const cleaned = Array.isArray(functionPermissions)
    ? functionPermissions
        .filter((p) => p && p.function && p.authority)
        .map((p) => ({
          function: String(p.function).trim(),
          authority: String(p.authority).trim().toUpperCase(),
        }))
    : [];

  const bestByFunction = new Map();
  const seenByFunction = new Map();

  cleaned.forEach((permission) => {
    const fnKey = permission.function.toLowerCase();
    const seen = seenByFunction.get(fnKey) || [];
    seen.push(permission.authority);
    seenByFunction.set(fnKey, seen);

    const current = bestByFunction.get(fnKey);
    if (!current) {
      bestByFunction.set(fnKey, permission);
      return;
    }

    const currentRank = AUTHORITY_RANK[current.authority] || 0;
    const candidateRank = AUTHORITY_RANK[permission.authority] || 0;
    if (candidateRank > currentRank) {
      bestByFunction.set(fnKey, permission);
    }
  });

  const normalized = [...bestByFunction.values()];
  const duplicateWarnings = [];

  seenByFunction.forEach((authorities, fnKey) => {
    if (authorities.length <= 1) return;

    const kept = bestByFunction.get(fnKey);
    const discarded = [...new Set(authorities.filter((authority) => authority !== kept.authority))];

    duplicateWarnings.push({
      function: kept.function,
      keptAuthority: kept.authority,
      discardedAuthorities: discarded,
      totalEntries: authorities.length,
    });
  });

  return { normalized, duplicateWarnings };
};

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

    const { normalized: sanitized, duplicateWarnings } = normalizeFunctionPermissions(functionPermissions);

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

    if (duplicateWarnings.length > 0) {
      console.warn('[RBAC] Duplicate function permissions merged for user:', username, duplicateWarnings);
    }

    sendSuccess(res, {
      message: 'Access saved',
      user,
      warnings: duplicateWarnings,
    });
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
    
    console.log(`[DELETE USER] Attempting to delete user: ${epf}`);
    
    // First check if user exists
    const existingUser = await User.findOne({ username: epf });
    console.log(`[DELETE USER] Found user:`, existingUser ? existingUser.username : 'NOT FOUND');
    
    if (!existingUser) {
      console.log(`[DELETE USER] User not found: ${epf}`);
      return sendError(res, 404, 'User not found');
    }
    
    // Perform deletion
    const deletedUser = await User.findOneAndDelete({ username: epf });
    console.log(`[DELETE USER] Deleted user:`, deletedUser ? deletedUser.username : 'DELETION FAILED');
    
    if (!deletedUser) {
      console.log(`[DELETE USER] Failed to delete user: ${epf}`);
      return sendError(res, 500, 'Failed to delete user');
    }

    console.log(`[DELETE USER] Successfully deleted user: ${epf}`);
    sendSuccess(res, { message: 'User role deleted', username: epf });
  } catch (error) {
    console.error(`[DELETE USER] Error:`, error);
    next(error);
  }
};
