const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { AppError } = require('../utils/AppError');

function extractTokenFromRequest(req) {
  const accessFromCookie = req.cookies?.accessToken;
  if (accessFromCookie) return accessFromCookie;

  const auth = req.headers.authorization;
  if (auth && typeof auth === 'string' && auth.startsWith('Bearer ')) {
    return auth.slice('Bearer '.length).trim();
  }

  return null;
}

function authJwt(required = true) {
  return (req, res, next) => {
    try {
      const token = extractTokenFromRequest(req);

      if (!token) {
        if (!required) return next();
        throw new AppError('Unauthorized', { statusCode: 401, code: 'UNAUTHORIZED' });
      }

      const payload = jwt.verify(token, env.jwt.accessSecret);

      req.user = {
        id: payload.sub,
        roles: payload.roles || payload.role || [],
        tokenJti: payload.jti,
      };

      return next();
    } catch (err) {
      if (!required) return next();
      return next(new AppError('Unauthorized', { statusCode: 401, code: 'UNAUTHORIZED' }));
    }
  };
}

module.exports = { authJwt };
