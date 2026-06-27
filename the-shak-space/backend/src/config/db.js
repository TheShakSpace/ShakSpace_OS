const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

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

// Listen for connection state changes after the initial connect, so the
// terminal always reflects reality (e.g. wifi drops, Atlas cluster pauses).
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection lost. Trying to reconnect in the background...');
});

mongoose.connection.on('reconnected', () => {
  logger.success('MongoDB reconnected.');
});

async function connectMongo() {
  mongoose.set('strictQuery', true);

  const mongoUri = normalizeMongoUri(env.mongodbUri);
  const masked = maskMongoUri(mongoUri);

  logger.info(`Connecting to MongoDB at ${masked || '(no MONGODB_URI set)'} ...`);

  if (
    typeof mongoUri !== 'string' ||
    !mongoUri.trim() ||
    !(mongoUri.trim().startsWith('mongodb://') || mongoUri.trim().startsWith('mongodb+srv://'))
  ) {
    throw new Error(
      `Your MONGODB_URI in backend/.env looks wrong. It should start with "mongodb://" or "mongodb+srv://". Got: "${masked}"`
    );
  }

  const conn = await mongoose.connect(mongoUri, {
    autoIndex: env.nodeEnv !== 'production',
    serverSelectionTimeoutMS: 8000,
  });

  logger.success(`MongoDB connected — database: "${conn.connection.name}"`);

  return conn;
}

module.exports = { connectMongo };
