const Upload = require('../models/Upload');

// Handler to upload multiple files and save Cloudinary URLs to MongoDB
exports.uploadFiles = async (req, res, next) => {
  try {
    // Check for uploaded files that were processed by uploadBase64 middleware
    if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    // The files are already in the correct format: { url, public_id, resource_type }
    const mapped = req.uploadedFiles;

    const uploadDoc = new Upload({ files: mapped });
    await uploadDoc.save();

    return res.status(201).json({ success: true, data: uploadDoc });
  } catch (error) {
    next(error);
  }
};
