class AppError extends Error {
  constructor(message, { statusCode = 500, code = 'INTERNAL', details } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

module.exports = { AppError };

