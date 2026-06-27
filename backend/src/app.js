const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const { corsOptions } = require('./config/config');
const { errorHandler } = require('./middleware/errorHandler');
const { connectMongo } = require('./config/db');
const logger = require('./utils/logger');

const apiRoutes = require('./routes');

const app = express();

app.disable('x-powered-by');

app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use(morgan('combined'));

app.get('/health', (req, res) => {
  const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    success: true,
    status: 'ok',
    mongo: stateNames[mongoose.connection.readyState] ?? 'unknown',
  });
});

app.use('/api/v1', apiRoutes);

app.use(errorHandler);

// Tries to connect to MongoDB, but never blocks the server from starting.
// Routes that need the database will simply fail individually until this
// succeeds — that way you can still browse the app (and use Demo Mode) even
// if MongoDB isn't set up yet.
async function bootstrap() {
  try {
    await connectMongo();
  } catch (err) {
    logger.error('Could not connect to MongoDB. The server will keep running, but', { reason: err.message });
    logger.warn('any feature that needs a database (login, signup, workspaces, knowledge, automations) will not work until this is fixed.');
    logger.warn('Check backend/.env -> MONGODB_URI (and that your IP is allow-listed in MongoDB Atlas).');
  }
  return app;
}

module.exports = { app, bootstrap };

