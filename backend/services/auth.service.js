import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/User.js';
import logger from '../config/logger.js';
import { formatUserAccess } from '../utils/rbacHelpers.js';

// ========================================
// MOCK AD TOGGLE - FOR LOCAL TESTING ONLY
// ========================================
// Set to true to use mock AD login when you don't have access to office network
// Set to false to use real SMART API Active Directory validation
const USE_MOCK_AD = true; // ← CHANGE THIS TO false FOR PRODUCTION
// ========================================

import { mockValidateADLogin, mockCheckADAvailability } from './auth.service.mock.js';

// Environment variables for AD API
const SMART_API_URL_PREFIX = process.env.SMART_API_URL_PREFIX || 'http://smartceb.ceb:81/SMART_API/';
const AD_VALIDATE_LOGIN_URL = `${SMART_API_URL_PREFIX}api/UserManagement/ValidateADLogin`;
const AD_CHECK_USER_AVAILABILITY_URL = `${SMART_API_URL_PREFIX}api/UserManagement/IsLDAPUserAvailable`;

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

/**
 * Generate JWT token for authenticated user
 * @param {string} username - Username
 * @param {boolean} isSuperAdmin - Is SuperAdmin
 * @param {string} displayName - Display name
 * @returns {string} - JWT token
 */
export const generateToken = (username, isSuperAdmin, displayName) => {
  return jwt.sign({ username, isSuperAdmin, displayName }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Validate AD login credentials
 * @param {string} ad_user_name - AD username
 * @param {string} ad_password - AD password
 * @returns {Object} - { success, token, user, message }
 */
export const validateADLogin = async (ad_user_name, ad_password) => {
  if (!ad_user_name || !ad_password) {
    throw new Error('Username and password are required');
  }

  // Use mock AD if enabled
  if (USE_MOCK_AD) {
    logger.warn('[MOCK MODE] Using mock AD authentication - NOT for production!');
    const mockResponse = await mockValidateADLogin(ad_user_name, ad_password);
    
    // Process mock response same as real AD response
    const adUser = mockResponse.data.SmartCEBUser;
    const username = adUser.ad_username || ad_user_name;
    
    // Check if user exists in RBAC database
    const dbUser = await User.findOne({ username });
    
    // Update last login timestamp if user exists in DB
    if (dbUser) {
      dbUser.lastLogin = new Date();
      await dbUser.save();
    }
    
    // Format display name based on gender (Ms./Mr. prefix)
    let displayName = adUser.display_name || `${adUser.first_name} ${adUser.last_name}`.trim();
    if (adUser.gender === 'F' || adUser.gender === 'f') {
      displayName = `Ms. ${displayName}`;
    } else if (adUser.gender === 'M' || adUser.gender === 'm') {
      displayName = `Mr. ${displayName}`;
    }
    
    // Generate JWT token with displayName
    const token = generateToken(username, dbUser?.isSuperAdmin || false, displayName);
    
    return {
      isSuccess: true,
      token,
      user: {
        username,
        isSuperAdmin: dbUser?.isSuperAdmin || false,
        functionPermissions: dbUser?.functionPermissions || [],
        displayName,
        email: adUser.ad_username,
        accessInfo: dbUser ? formatUserAccess(dbUser) : {},
      },
      message: 'Login successful (MOCK MODE)',
    };
  }

  // Real AD validation
  logger.info(`AD Login attempt for user: ${ad_user_name}`);

  try {
    // Call SMART API to validate AD credentials
    const response = await axios.post(
      AD_VALIDATE_LOGIN_URL,
      {
        ad_user_name,
        ad_password,
      },
      { timeout: 10000 }
    );

    if (response.data?.isSuccess && response.data?.SmartCEBUser) {
      const adUser = response.data.SmartCEBUser;
      const username = adUser.ad_username || ad_user_name;

      logger.info(`AD validation successful for user: ${username}`);

      // Check if user exists in RBAC database
      const dbUser = await User.findOne({ username });

      // Update last login timestamp if user exists in DB
      if (dbUser) {
        dbUser.lastLogin = new Date();
        await dbUser.save();
      }

      // Format display name based on gender (Ms./Mr. prefix)
      let displayName = adUser.display_name || `${adUser.first_name} ${adUser.last_name}`.trim();
      if (adUser.gender === 'F' || adUser.gender === 'f') {
        displayName = `Ms. ${displayName}`;
      } else if (adUser.gender === 'M' || adUser.gender === 'm') {
        displayName = `Mr. ${displayName}`;
      }

      // Generate JWT token with displayName
      const token = generateToken(username, dbUser?.isSuperAdmin || false, displayName);

      // Return success with token and user info
      return {
        isSuccess: true,
        token,
        user: {
          username,
          isSuperAdmin: dbUser?.isSuperAdmin || false,
          functionPermissions: dbUser?.functionPermissions || [],
          displayName,
          email: adUser.ad_username,
          accessInfo: dbUser ? formatUserAccess(dbUser) : {},
        },
        message: 'Login successful',
      };
    } else {
      const errorMsg = response.data?.message || 'AD validation failed';
      logger.warn(`AD validation failed for user ${ad_user_name}: ${errorMsg}`);
      throw new Error(errorMsg);
    }
  } catch (adError) {
    const errorMessage =
      adError.response?.data?.message || adError.message || 'Failed to validate credentials with AD';

    logger.error(`AD API error for user ${ad_user_name}:`, errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Check if user is available in Active Directory
 * @param {string} user_name - Username to check
 * @returns {Object} - { IsSuccess, message }
 */
export const checkADAvailability = async (user_name) => {
  if (!user_name) {
    throw new Error('Username is required');

    // Use mock AD if enabled
    if (USE_MOCK_AD) {
      logger.warn('[MOCK MODE] Using mock AD availability check');
      const mockResponse = await mockCheckADAvailability(user_name);
      return {
        IsSuccess: mockResponse.data.IsSuccess,
      };
    }
  }

  logger.info(`Checking AD availability for user: ${user_name}`);

  try {
    const response = await axios.get(
      `${AD_CHECK_USER_AVAILABILITY_URL}?user_name=${encodeURIComponent(String(user_name))}`,
      { timeout: 10000 }
    );

    if (response.data?.IsSuccess !== undefined) {
      logger.info(`AD availability check for ${user_name}: ${response.data.IsSuccess}`);
      return {
        IsSuccess: response.data.IsSuccess,
      };
    } else {
      throw new Error('Invalid response format from AD API');
    }
  } catch (adError) {
    const errorMessage =
      adError.response?.data?.message || adError.message || 'Failed to check user availability';

    logger.error(`AD API error for user ${user_name}:`, errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Get current user data from JWT token
 * @param {string} username - Username from token
 * @param {boolean} isSuperAdmin - Is SuperAdmin from token
 * @param {string} displayName - Display name from token
 * @returns {Object} - User data
 */
export const getCurrentUser = async (username, isSuperAdmin, displayName) => {
  // Fetch fresh permissions from database (user may not exist in DB)
  const dbUser = await User.findOne({ username });

  return {
    username,
    isSuperAdmin: dbUser?.isSuperAdmin || isSuperAdmin || false,
    functionPermissions: dbUser?.functionPermissions || [],
    name: displayName || username,
    mobileNo: username, // Use username as fallback for mobileNo
  };
};
