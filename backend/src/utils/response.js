function success(res, data, { status = 200 } = {}) {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.set('Pragma', 'no-cache');
  return res.status(status).json({ success: true, data });
}

function created(res, data) {
  return success(res, data, { status: 201 });
}

function fail(res, statusCode, code, message, details) {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
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
