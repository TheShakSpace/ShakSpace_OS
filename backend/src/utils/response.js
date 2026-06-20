function success(res, data, { status = 200 } = {}) {
  return res.status(status).json({ success: true, data });
}

function created(res, data) {
  return success(res, data, { status: 201 });
}

function fail(res, statusCode, code, message, details) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}

module.exports = { success, created, fail };

