const express = require('express');
const router = express.Router();
const {
  getStories,
  getStory,
  createStory,
  updateStory,
  deleteStory,
  addStoryCard,
  removeStoryCard,
} = require('../controllers/storyController');
const { protect, isSeller } = require('../middleware/auth');

// Public routes
router.get('/', getStories);
router.get('/:id', getStory);

// Protected routes
router.post('/', protect, isSeller, createStory);
router.put('/:id', protect, isSeller, updateStory);
router.delete('/:id', protect, isSeller, deleteStory);
router.put('/:id/story-cards', protect, isSeller, addStoryCard);
router.delete('/:id/story-cards/:storyCardId', protect, isSeller, removeStoryCard);

module.exports = router;

