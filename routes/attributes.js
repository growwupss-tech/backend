const express = require('express');
const router = express.Router();
const {
  getAttributes,
  getAttribute,
  createAttribute,
  updateAttribute,
  deleteAttribute,
} = require('../controllers/attributesController');
const { protect, isSeller } = require('../middleware/auth');

// Public routes
router.get('/', getAttributes);
router.get('/:id', getAttribute);

// Protected routes
router.post('/', protect, isSeller, createAttribute);
router.put('/:id', protect, isSeller, updateAttribute);
router.delete('/:id', protect, isSeller, deleteAttribute);

module.exports = router;

