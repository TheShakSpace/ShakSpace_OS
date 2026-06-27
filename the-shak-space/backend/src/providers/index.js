const { AppError } = require('../utils/AppError');

const providers = {
  gemini: () => require('./gemini.provider'),
  ollama: () => require('./ollama.provider'),
  openai: () => require('./openai.provider'),
};

function getProvider(name) {
  const key = String(name || 'gemini').toLowerCase();
  const factory = providers[key];
  if (!factory) {
    throw new AppError('Invalid AI provider', {
      statusCode: 400,
      code: 'INVALID_PROVIDER',
    });
  }
  return factory();
}

module.exports = { getProvider };
