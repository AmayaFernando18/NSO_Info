import { RBAC_FUNCTIONS } from '../config/rbacFunctions.js';

/**
 * RBAC (Role-Based Access Control) Helper Functions - Function-Wise
 *
 * Authority Levels (function-based):
 * E - Enter: View + Create
 * C - Check: View only
 * A - Approve: View + Approve
 * M - Manager: View + Create + Edit + Delete + Approve
 * SuperAdmin: Full access everywhere
 */

/**
 * Check if user has required authority for a specific function
 * @param {Object} user - User object from request
 * @param {string} requiredAuthority - Required authority level (E, C, A, M)
 * @param {string} func - Function name (e.g., "News", "Hero")
 * @returns {boolean} - True if user has required authority
 */
export const hasAuthorityForFunction = (user, requiredAuthority, func) => {
  // Superadmin has all access
  if (user?.isSuperAdmin) return true;

  if (!user?.functionPermissions || user.functionPermissions.length === 0) {
    return false;
  }

  // Find permission for this function
  const permission = user.functionPermissions.find(
    (p) => p.function.toLowerCase() === func.toLowerCase()
  );

  if (!permission) return false;

  // Allow if user's authority is at least the required one by hierarchy
  if (permission.authority === 'M') return true;
  return authorityHierarchy(permission.authority) >= authorityHierarchy(requiredAuthority);
};

/**
 * Get authority hierarchy numeric value
 * Higher value = more permissions
 * @param {string} authority - Authority code
 * @returns {number}
 */
const authorityHierarchy = (authority) => {
  const hierarchy = {
    E: 1, // Enter - lowest
    C: 2, // Check
    A: 3, // Approve
    M: 4, // Manager - highest (except superadmin)
  };
  return hierarchy[authority] || 0;
};

/**
 * Check if user can perform action on a specific function
 * @param {Object} user - User object
 * @param {string} action - Action type ('view', 'create', 'edit', 'delete', 'approve')
 * @param {string} func - Function name
 * @returns {boolean}
 */
export const canPerformAction = (user, action, func) => {
  if (user?.isSuperAdmin) return true;

  // Normalize action name
  const a = String(action || '').toLowerCase();

  if (!user || !user.functionPermissions) return false;

  const permission = user.functionPermissions.find(
    (p) => String(p.function).toLowerCase() === String(func).toLowerCase()
  );

  if (!permission) return false;

  const authority = permission.authority;

  // Permissions matrix
  // E (Enter): VIEW ✅, CREATE ✅, EDIT ⚠️ (only if not approved), APPROVE ❌, DELETE ❌
  // C (Check): VIEW ✅, CREATE ❌, EDIT ❌, APPROVE ❌, DELETE ❌
  // A (Approve): VIEW ✅, CREATE ❌, EDIT ❌, APPROVE ✅, DELETE ❌
  // M (Manager): VIEW ✅, CREATE ✅, EDIT ✅, APPROVE ✅, DELETE ✅
  const ALLOW = {
    view: ['E', 'C', 'A', 'M'],
    create: ['E', 'M'],
    edit: ['M'], // E can edit only through canEditUnapproved helper
    delete: ['M'],
    approve: ['A', 'M'],
  };

  const allowedAuthorities = ALLOW[a];
  if (!allowedAuthorities) return false;
  return allowedAuthorities.includes(authority);
};

/**
 * Check if user can edit an item in an approval workflow
 * Rules for functions with approval workflows:
 * - SuperAdmin: Can always edit
 * - Manager (M): Can always edit
 * - Enter (E): Can edit only if item is NOT approved
 * - Check (C): Cannot edit
 * - Approve (A): Cannot edit
 *
 * Used for items requiring approval (like Hero, News, etc.)
 *
 * @param {Object} user - User object
 * @param {string} func - Function name
 * @param {boolean} isApproved - Whether the item is already approved
 * @returns {boolean}
 */
export const canEditUnapproved = (user, func, isApproved = false) => {
  if (user?.isSuperAdmin) return true;

  if (!user || !user.functionPermissions) return false;

  const permission = user.functionPermissions.find(
    (p) => String(p.function).toLowerCase() === String(func).toLowerCase()
  );

  if (!permission) return false;

  // Manager can always edit
  if (permission.authority === 'M') return true;

  // Enter can edit only if not approved yet
  if (permission.authority === 'E' && !isApproved) return true;

  // Check and Approve users cannot edit anything
  return false;
};

/**
 * Get all functions where user has access
 * @param {Object} user - User object
 * @returns {Array<string>} - Array of function names
 */
export const getUserFunctions = (user) => {
  if (user?.isSuperAdmin) {
    return [...RBAC_FUNCTIONS];
  }

  if (!user?.functionPermissions || user.functionPermissions.length === 0) {
    return [];
  }

  return user.functionPermissions.map((p) => p.function);
};

/**
 * Get user's authority level for a specific function
 * @param {Object} user - User object
 * @param {string} func - Function name
 * @returns {string|null} - Authority code or null if no access
 */
export const getAuthorityForFunction = (user, func) => {
  if (user?.isSuperAdmin) return 'M';

  if (!user?.functionPermissions || user.functionPermissions.length === 0) {
    return null;
  }

  const permission = user.functionPermissions.find(
    (p) => p.function.toLowerCase() === func.toLowerCase()
  );

  return permission?.authority || null;
};

/**
 * Format user access info for display
 * @param {Object} user - User object
 * @returns {Object} - Formatted access info
 */
export const formatUserAccess = (user) => {
  if (user?.isSuperAdmin) {
    return {
      role: 'SuperAdmin',
      description: 'Full access to all functions',
      functions: 'All',
    };
  }

  if (!user?.functionPermissions || user.functionPermissions.length === 0) {
    return {
      role: 'No-Access',
      description: 'No function permissions configured',
      functions: [],
    };
  }

  const functionList = user.functionPermissions.map((p) => ({
    function: p.function,
    authority: p.authority,
    description: getAuthorityDescription(p.authority),
  }));

  return {
    role: 'User',
    description: 'Function-based access',
    functions: functionList,
  };
};

/**
 * Get human-readable description for authority level
 * @param {string} authority - Authority code
 * @returns {string}
 */
const getAuthorityDescription = (authority) => {
  const descriptions = {
    E: 'Enter (View + Create)',
    C: 'Check (View only)',
    A: 'Approve (View + Approve)',
    M: 'Manager (Full access)',
  };
  return descriptions[authority] || 'Unknown';
};
