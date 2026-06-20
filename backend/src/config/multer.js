const multer = require('multer');
const env = require('./env');

const memoryStorage = multer.memoryStorage();

const maxBytes = env.uploads.maxUploadMb * 1024 * 1024;

const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: maxBytes,
  },
});

module.exports = { upload };

