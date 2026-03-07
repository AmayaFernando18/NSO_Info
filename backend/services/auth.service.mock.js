/**
 * Mock AD Service for Local Testing
 * 
 * This mock service simulates Active Directory authentication for local development
 * when you don't have access to the office network/SMART API.
 * 
 * Mock Users:
 * - Username: "admin" / Password: "admin123" → SuperAdmin user
 * - Username: "john" / Password: "john123" → Regular user with News permissions
 * - Username: "jane" / Password: "jane123" → Regular user with multiple permissions
 * - Any other username/password combination → Login fails
 */

import logger from '../config/logger.js';

/**
 * Mock AD login validation (simulates SMART API response)
 * @param {string} ad_user_name - AD username
 * @param {string} ad_password - AD password
 * @returns {Object} - Mock AD response
 */
export const mockValidateADLogin = async (ad_user_name, ad_password) => {
  logger.info(`[MOCK AD] Login attempt for user: ${ad_user_name}`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Define mock users
  const mockUsers = {
    admin: {
      password: 'admin123',
      ad_username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      display_name: 'Admin User',
      gender: 'M',
    },
    john: {
      password: 'john123',
      ad_username: 'john',
      first_name: 'John',
      last_name: 'Doe',
      display_name: 'John Doe',
      gender: 'M',
    },
    jane: {
      password: 'jane123',
      ad_username: 'jane',
      first_name: 'Jane',
      last_name: 'Smith',
      display_name: 'Jane Smith',
      gender: 'F',
    },
  };

  const user = mockUsers[ad_user_name];

  if (user && user.password === ad_password) {
    logger.info(`[MOCK AD] Validation successful for user: ${ad_user_name}`);

    return {
      data: {
        isSuccess: true,
        SmartCEBUser: {
          ad_username: user.ad_username,
          first_name: user.first_name,
          last_name: user.last_name,
          display_name: user.display_name,
          gender: user.gender,
        },
      },
    };
  } else {
    logger.warn(`[MOCK AD] Invalid credentials for user: ${ad_user_name}`);
    throw new Error('Invalid username or password');
  }
};

/**
 * Mock AD user availability check
 * @param {string} user_name - Username to check
 * @returns {Object} - Mock availability response
 */
export const mockCheckADAvailability = async (user_name) => {
  logger.info(`[MOCK AD] Checking availability for user: ${user_name}`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // These users exist in our mock AD
  const existingUsers = ['admin', 'john', 'jane'];

  return {
    data: {
      IsSuccess: existingUsers.includes(user_name),
    },
  };
};
