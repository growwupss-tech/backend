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
const { protect, isSeller } = require('../middleware/auth');
const { uploadMultipleBase64 } = require('../middleware/uploadBase64');

// Protected routes - require authentication
router.get('/', protect, getProducts);
router.get('/:id', protect, getProduct);
router.put('/:id/redirect', protect, incrementRedirect);

// Protected routes with file upload
router.post('/', protect, isSeller, uploadMultipleBase64('images', 10), createProduct);
router.put('/:id', protect, isSeller, uploadMultipleBase64('images', 10), updateProduct);
router.delete('/:id', protect, isSeller, deleteProduct);

module.exports = router;

