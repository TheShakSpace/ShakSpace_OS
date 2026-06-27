const http = require('http');
const { app, bootstrap } = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');

async function start() {
  logger.info('Starting The Shak Space backend...');
  logger.info(`Environment: ${env.nodeEnv}`);

  await bootstrap();

  const server = http.createServer(app);

  const port = env.port;
  server.listen(port, () => {
    logger.success(`Server is running -> http://localhost:${port}`);
    logger.info(`Health check       -> http://localhost:${port}/health`);
    logger.info(`Allowed frontend    -> ${env.cors.origins.join(', ')}`);
  });

  const shutdown = (signal) => {
    logger.warn(`Received ${signal}. Shutting down...`);
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  logger.error('Fatal error starting server', { message: err.message });
  process.exit(1);
});

