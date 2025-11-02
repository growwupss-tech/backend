const express = require('express');
const router = express.Router();
const {
  getStoryCards,
  getStoryCard,
  createStoryCard,
  updateStoryCard,
  deleteStoryCard,
} = require('../controllers/storyCardsController');
const { protect, isSeller } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Public routes
router.get('/', getStoryCards);
router.get('/:id', getStoryCard);

// Protected routes with file upload
router.post('/', protect, isSeller, uploadSingle('story_card_image'), createStoryCard);
router.put('/:id', protect, isSeller, uploadSingle('story_card_image'), updateStoryCard);
router.delete('/:id', protect, isSeller, deleteStoryCard);

module.exports = router;

