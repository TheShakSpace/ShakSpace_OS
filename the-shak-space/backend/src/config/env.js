const dotenv = require('dotenv');
const path = require('path');
const process = require('process');

// Load .env deterministically from the backend root.
// This avoids issues when the process cwd differs (e.g., monorepo tooling).
const envPath = path.resolve(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });


function required(name) {
  const v = process.env[name];
  if (v === undefined || v === null || String(v).trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

function toInt(name, def) {
  const v = process.env[name];
  if (v === undefined || v === null || String(v).trim() === '') {
    return def;
  }
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) throw new Error(`Invalid integer for ${name}`);
  return n;
}

function toBool(name, def) {
  const v = process.env[name];
  if (v === undefined || v === null || String(v).trim() === '') return def;
  return String(v).toLowerCase() === 'true';
}

function getCorsOrigin() {
  // Allow comma-separated origins
  const raw = process.env.CORS_ORIGIN || '';
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean);
  return list.length ? list : ['http://localhost:5173'];
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toInt('PORT', 4000),
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`,

  mongodbUri: process.env.MONGODB_URI || '',


  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessTtlSeconds: toInt('JWT_ACCESS_TTL_SECONDS', 900),
    refreshTtlSeconds: toInt('JWT_REFRESH_TTL_SECONDS', 2592000),
  },

  cookie: {
    domain: process.env.COOKIE_DOMAIN || undefined,
    secure: toBool('COOKIE_SECURE', false),
    sameSite: process.env.COOKIE_SAMESITE || 'lax',
    // httpOnly is always true for security
    httpOnly: true,
  },

  cors: {
    origins: getCorsOrigin(),
    credentials: true,
  },

  cloudinary: {
    cloudName: required('CLOUDINARY_CLOUD_NAME'),
    apiKey: required('CLOUDINARY_API_KEY'),
    apiSecret: required('CLOUDINARY_API_SECRET'),
  },

  uploads: {
    maxUploadMb: toInt('MAX_UPLOAD_MB', 10),
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    defaultModel: process.env.GEMINI_DEFAULT_MODEL || 'gemini-2.0-flash',
  },
};

