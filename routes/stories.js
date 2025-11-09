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

// Protected routes - require authentication
router.get('/', protect, getStories);
router.get('/:id', protect, getStory);

// Protected routes
router.post('/', protect, isSeller, createStory);
router.put('/:id', protect, isSeller, updateStory);
router.delete('/:id', protect, isSeller, deleteStory);
router.put('/:id/story-cards', protect, isSeller, addStoryCard);
router.delete('/:id/story-cards/:storyCardId', protect, isSeller, removeStoryCard);

module.exports = router;

