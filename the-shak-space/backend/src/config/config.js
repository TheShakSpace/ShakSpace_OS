const env = require('./env');

module.exports = {
  env,
  corsOptions: {
    origin(origin, cb) {
      // If no origin (e.g. same-origin requests), allow.
      if (!origin) return cb(null, true);
      const allowed = env.cors.origins.includes(origin);
      return cb(allowed ? null : new Error('CORS origin not allowed'), allowed);
    },
    credentials: env.cors.credentials,
  },
  cookieOptions: {
    domain: env.cookie.domain,
    httpOnly: env.cookie.httpOnly,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
  },
};

