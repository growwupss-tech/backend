const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadMultipleBase64 } = require('../middleware/uploadBase64');
const { uploadFiles } = require('../controllers/uploadsController');

// POST /api/uploads - Protected route
// field name: 'files' (multiple)
router.post('/', protect, uploadMultipleBase64('files', 10), uploadFiles);

module.exports = router;
