const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, optionalProtect, isSeller } = require('../middleware/auth');

// Public routes (with optional auth for filtering)
router.get('/', optionalProtect, getCategories);
router.get('/:id', optionalProtect, getCategory);

// Protected routes
router.post('/', protect, isSeller, createCategory);
router.put('/:id', protect, isSeller, updateCategory);
router.delete('/:id', protect, isSeller, deleteCategory);

module.exports = router;

