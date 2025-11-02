const express = require('express');
const router = express.Router();
const {
  getHeroSlides,
  getHeroSlide,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
} = require('../controllers/heroSlidesController');
const { protect, isSeller } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Public routes
router.get('/', getHeroSlides);
router.get('/:id', getHeroSlide);

// Protected routes with file upload
router.post('/', protect, isSeller, uploadSingle('image'), createHeroSlide);
router.put('/:id', protect, isSeller, uploadSingle('image'), updateHeroSlide);
router.delete('/:id', protect, isSeller, deleteHeroSlide);

module.exports = router;

