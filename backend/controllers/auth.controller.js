import { validateADLogin, checkADAvailability, getCurrentUser } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * POST /auth/login
 * Validates AD credentials and creates/updates user in the database
 */
export const login = async (req, res, next) => {
  try {
    const { ad_user_name, ad_password } = req.body;

    const result = await validateADLogin(ad_user_name, ad_password);

    sendSuccess(res, result);
  } catch (error) {
    sendError(res, 401, error.message);
  }
};

/**
 * GET /auth/check-availability
 * Checks if a user is available in Active Directory
 */
export const checkAvailability = async (req, res, next) => {
  try {
    const { user_name } = req.query;

    const result = await checkADAvailability(user_name);

    sendSuccess(res, result);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

/**
 * GET /auth/me
 * Get current user data from JWT token
 */
export const getMe = async (req, res, next) => {
  try {
    const { username, isSuperAdmin, displayName } = req.tokenUser || req.user;

    const user = await getCurrentUser(username, isSuperAdmin, displayName);

    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};
