const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/mov',
      'video/avi',
      'video/webm',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
    }
  },
});

// Helper to convert Buffer to base64 and upload to Cloudinary
const uploadToCloudinary = async (buffer, mimetype) => {
  try {
    // Convert buffer to base64
    const base64 = buffer.toString('base64');
    const base64Prefix = `data:${mimetype};base64,`;
    const base64Data = base64Prefix + base64;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: 'site-snap',
      resource_type: 'auto',
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Middleware for processing uploads
const processUploads = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    // Process each file
    const uploadPromises = req.files.map(async (file) => {
      return await uploadToCloudinary(file.buffer, file.mimetype);
    });

    // Wait for all uploads to complete
    const uploadResults = await Promise.all(uploadPromises);

    // Attach the results to the request object
    req.uploadedFiles = uploadResults;

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware for single file upload
const uploadSingleBase64 = (fieldName = 'file') => {
  return [upload.single(fieldName), processUploads];
};

// Middleware for multiple file uploads
const uploadMultipleBase64 = (fieldName = 'files', maxCount = 10) => {
  return [upload.array(fieldName, maxCount), processUploads];
};

// Middleware for specific fields
const uploadFieldsBase64 = (fields) => {
  return [upload.fields(fields), processUploads];
};

module.exports = {
  uploadSingleBase64,
  uploadMultipleBase64,
  uploadFieldsBase64,
};