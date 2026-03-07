/**
 * Simple API response helpers
 * Standardize successful and error JSON responses across controllers.
 */
export const sendSuccess = (res, payload = {}, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    ...payload,
  });
};

export const sendCreated = (res, payload = {}) => sendSuccess(res, payload, 201);

export const sendError = (res, statusCode = 500, message = 'Server error') => {
  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
