import logger from '../config/logger.js';

function notFoundHandler(req, res) {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
}

function errorHandler(err, req, res, _next) {
  const status = err.status || 500;

  // Log error with context
  const logContext = {
    method: req.method,
    url: req.originalUrl,
    status,
    message: err.message,
    stack: err.stack,
  };

  if (status >= 500) {
    logger.error('Server error', logContext);
  } else {
    logger.warn('Client error', logContext);
  }

  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    details: err.details || undefined,
  });
}

export {
  notFoundHandler,
  errorHandler,
};
