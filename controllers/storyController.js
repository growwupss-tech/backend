const Story = require('../models/Story');

// @desc    Get all stories
// @route   GET /api/stories
// @access  Public
const getStories = async (req, res) => {
  try {
    const { is_visible } = req.query;
    let query = {};

    if (is_visible !== undefined) {
      query.is_visible = is_visible === 'true';
    }

    const stories = await Story.find(query).populate('story_card_ids');
    res.status(200).json({ success: true, count: stories.length, data: stories });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single story
// @route   GET /api/stories/:id
// @access  Public
const getStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('story_card_ids');

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    res.status(200).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create story
// @route   POST /api/stories
// @access  Private
const createStory = async (req, res) => {
  try {
    const story = await Story.create(req.body);
    const populatedStory = await Story.findById(story._id).populate('story_card_ids');
    res.status(201).json({ success: true, data: populatedStory });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update story
// @route   PUT /api/stories/:id
// @access  Private
const updateStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('story_card_ids');

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    res.status(200).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete story
// @route   DELETE /api/stories/:id
// @access  Private
const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    await story.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add story card to story
// @route   PUT /api/stories/:id/story-cards
// @access  Private
const addStoryCard = async (req, res) => {
  try {
    const { story_card_id } = req.body;
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (!story.story_card_ids.includes(story_card_id)) {
      story.story_card_ids.push(story_card_id);
      await story.save();
    }

    const updatedStory = await Story.findById(req.params.id).populate('story_card_ids');
    res.status(200).json({ success: true, data: updatedStory });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove story card from story
// @route   DELETE /api/stories/:id/story-cards/:storyCardId
// @access  Private
const removeStoryCard = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    story.story_card_ids = story.story_card_ids.filter(
      id => id.toString() !== req.params.storyCardId
    );
    await story.save();

    const updatedStory = await Story.findById(req.params.id).populate('story_card_ids');
    res.status(200).json({ success: true, data: updatedStory });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getStories,
  getStory,
  createStory,
  updateStory,
  deleteStory,
  addStoryCard,
  removeStoryCard,
};

