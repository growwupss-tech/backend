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
const { uploadMultiple } = require('../middleware/upload');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);
router.put('/:id/redirect', incrementRedirect);

// Protected routes with file upload
router.post('/', protect, isSeller, uploadMultiple('images', 10), createProduct);
router.put('/:id', protect, isSeller, uploadMultiple('images', 10), updateProduct);
router.delete('/:id', protect, isSeller, deleteProduct);

module.exports = router;

