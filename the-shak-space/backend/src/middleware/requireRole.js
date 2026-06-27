const { AppError } = require('../utils/AppError');

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const roles = req.user?.roles || [];
    const ok = roles.some((r) => allowedRoles.includes(r));
    if (!ok) {
      return next(new AppError('Forbidden', { statusCode: 403, code: 'FORBIDDEN' }));
    }
    return next();
  };
}

module.exports = { requireRole };

