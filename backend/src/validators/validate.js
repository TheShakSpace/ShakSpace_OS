const { validationResult } = require('express-validator');
const { AppError } = require('../utils/AppError');

function runValidation(req) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const details = result.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    throw new AppError('Validation failed', {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details,
    });
  }
}

/**
 * Works as Express middleware (req, res, next) and as a sync helper (req) in controllers.
 */
function validateRequest(req, res, next) {
  try {
    runValidation(req);
    if (typeof next === 'function') {
      return next();
    }
    return undefined;
  } catch (err) {
    if (typeof next === 'function') {
      return next(err);
    }
    throw err;
  }
}

module.exports = { validateRequest, runValidation };
