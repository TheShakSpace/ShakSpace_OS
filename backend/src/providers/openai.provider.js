const { AppError } = require('../utils/AppError');

async function generateResponse() {
  throw new AppError('OpenAI provider is not implemented', {
    statusCode: 501,
    code: 'PROVIDER_NOT_IMPLEMENTED',
  });
}

module.exports = { generateResponse };
