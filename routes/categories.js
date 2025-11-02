const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, isSeller } = require('../middleware/auth');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected routes
router.post('/', protect, isSeller, createCategory);
router.put('/:id', protect, isSeller, updateCategory);
router.delete('/:id', protect, isSeller, deleteCategory);

module.exports = router;

