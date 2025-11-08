const express = require('express');
const router = express.Router();
const { uploadMultipleBase64 } = require('../middleware/uploadBase64');
const { uploadFiles } = require('../controllers/uploadsController');

// POST /api/uploads
// field name: 'files' (multiple)
router.post('/', uploadMultipleBase64('files', 10), uploadFiles);

module.exports = router;
