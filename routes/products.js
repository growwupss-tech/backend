const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  incrementRedirect,
} = require('../controllers/productController');
const { protect, optionalProtect, isSeller } = require('../middleware/auth');
const { uploadMultipleBase64 } = require('../middleware/uploadBase64');

// Public routes (with optional auth for filtering)
router.get('/', optionalProtect, getProducts);
router.get('/:id', optionalProtect, getProduct);
router.put('/:id/redirect', incrementRedirect);

// Protected routes with file upload
router.post('/', protect, isSeller, uploadMultipleBase64('images', 10), createProduct);
router.put('/:id', protect, isSeller, uploadMultipleBase64('images', 10), updateProduct);
router.delete('/:id', protect, isSeller, deleteProduct);

module.exports = router;

