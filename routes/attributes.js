const express = require('express');
const router = express.Router();
const {
  getAttributes,
  getAttribute,
  createAttribute,
  updateAttribute,
  deleteAttribute,
} = require('../controllers/attributesController');
const { protect, optionalProtect, isSeller } = require('../middleware/auth');

// Public routes (with optional auth for filtering)
router.get('/', optionalProtect, getAttributes);
router.get('/:id', optionalProtect, getAttribute);

// Protected routes
router.post('/', protect, isSeller, createAttribute);
router.put('/:id', protect, isSeller, updateAttribute);
router.delete('/:id', protect, isSeller, deleteAttribute);

module.exports = router;

