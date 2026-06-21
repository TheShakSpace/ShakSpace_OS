const mongoose = require('mongoose');
const env = require('./env');

function maskMongoUri(uri) {
  if (!uri || typeof uri !== 'string') return uri;
  // Mask credentials part if present: mongodb+srv://user:pass@host
  return uri.replace(/(mongodb\+srv:\/\/)([^:@/]+):([^@/]+)(@)/i, '$1$2:****$4');
}

function normalizeMongoUri(uri) {
  if (!uri || typeof uri !== 'string') return uri;
  const trimmed = uri.trim();

  // Common mis-config: env var accidentally contains the literal assignment.
  // Example: "MONGODB_URI=mongodb+srv://..."
  if (trimmed.startsWith('MONGODB_URI=')) {
    return trimmed.replace(/^MONGODB_URI=/, '').trim();
  }

  // Another common mis-config when copying env: includes quotes.
  return trimmed.replace(/^['"]|['"]$/g, '');
}

async function connectMongo() {
  mongoose.set('strictQuery', true);

  const mongoUri = normalizeMongoUri(env.mongodbUri);

  // Temporary debug logging to verify env parsing & URI normalization.
  // (Masked to avoid leaking credentials.)
  const masked = maskMongoUri(mongoUri);
  // eslint-disable-next-line no-console
  console.log('[MongoDB] Loaded MONGODB_URI (masked):', masked);

  if (
    typeof mongoUri !== 'string' ||

    !mongoUri.trim() ||
    !(mongoUri.trim().startsWith('mongodb://') || mongoUri.trim().startsWith('mongodb+srv://'))
  ) {
    const display = maskMongoUri(mongoUri);
    throw new Error(
      `Invalid MongoDB connection string. Expected to start with "mongodb://" or "mongodb+srv://". Got: ${display}`
    );
  }

  const conn = await mongoose.connect(mongoUri, {
    autoIndex: env.nodeEnv !== 'production',
  });

  return conn;
}




module.exports = { connectMongo };


