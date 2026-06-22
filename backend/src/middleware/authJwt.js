const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { AppError } = require('../utils/AppError');

function extractTokenFromRequest(req) {
  // Prefer httpOnly cookies
  const accessFromCookie = req.cookies?.accessToken;
  if (accessFromCookie) return accessFromCookie;

  // Fallback to Authorization header
  const auth = req.headers.authorization;
  if (auth && typeof auth === 'string' && auth.startsWith('Bearer ')) {
    return auth.slice('Bearer '.length).trim();
  }

  return null;
}

function authJwt(required = true) {
  return (req, res, next) => {
    try {
      console.log('[authJwt] before extracting token');

      const token = extractTokenFromRequest(req);

      console.log('[authJwt] after extracting token:', Boolean(token));

      if (!token) {


        if (!required) return next();
        throw new AppError('Unauthorized', { statusCode: 401, code: 'UNAUTHORIZED' });
      }


      const payload = jwt.verify(token, env.jwt.accessSecret);
      console.log('[authJwt] after jwt.verify');

      // expected payload: { sub: userId, roles: [...] }


      req.user = {
        // jwt controller uses: payload.sub = String(user._id)
        id: payload.sub,
        roles: payload.roles || payload.role || [],
        tokenJti: payload.jti,
      };


      console.log('[authJwt] before next()');
      return next();
    } catch (err) {

      if (!required) return next();
      return next(new AppError('Unauthorized', { statusCode: 401, code: 'UNAUTHORIZED' }));
    }
  };
}

module.exports = { authJwt };

