const { validationResult } = require('express-validator');
const { AppError } = require('../utils/AppError');

function validateRequest(req) {
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

module.exports = { validateRequest };

