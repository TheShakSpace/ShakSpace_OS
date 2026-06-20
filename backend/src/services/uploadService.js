const { cloudinary } = require('../config/cloudinary');
const { AppError } = require('../utils/AppError');

async function uploadToCloudinary(buffer, { filename, folder, resourceType = 'auto' } = {}) {
  if (!buffer) {
    throw new AppError('No file provided', { statusCode: 400, code: 'NO_FILE' });
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder || 'shakspace/uploads',
        resource_type: resourceType,
        filename,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

module.exports = { uploadToCloudinary };

