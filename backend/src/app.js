const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { corsOptions } = require('./config/config');
const { errorHandler } = require('./middleware/errorHandler');
const { connectMongo } = require('./config/db');

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
  res.json({
    success: true,
    status: 'ok',
  });
});

app.use('/api/v1', apiRoutes);

app.use(errorHandler);

// expose for server
async function bootstrap() {
  await connectMongo();
  return app;
}

module.exports = { app, bootstrap };

