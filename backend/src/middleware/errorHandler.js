const { AppError } = require('../utils/AppError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err instanceof AppError ? err.statusCode : err.statusCode || 500;
  const code = err instanceof AppError ? err.code : err.code || 'INTERNAL_ERROR';

  const payload = {
    success: false,
    error: {
      code,
      message: err.message || 'Internal server error',
      ...(err.details ? { details: err.details } : {}),
    },
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    payload.error.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}

module.exports = { errorHandler };

