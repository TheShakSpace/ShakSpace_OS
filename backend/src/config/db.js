const mongoose = require('mongoose');
const env = require('./env');

async function connectMongo() {
  mongoose.set('strictQuery', true);

  const conn = await mongoose.connect(env.mongodbUri, {
    autoIndex: env.nodeEnv !== 'production',
  });

  return conn;
}

module.exports = { connectMongo };

