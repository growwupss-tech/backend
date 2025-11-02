const Story_Cards = require('../models/Story_Cards');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all story cards
// @route   GET /api/story-cards
// @access  Public
const getStoryCards = async (req, res) => {
  try {
    const storyCards = await Story_Cards.find();
    res.status(200).json({ success: true, count: storyCards.length, data: storyCards });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single story card
// @route   GET /api/story-cards/:id
// @access  Public
const getStoryCard = async (req, res) => {
  try {
    const storyCard = await Story_Cards.findById(req.params.id);

    if (!storyCard) {
      return res.status(404).json({ message: 'Story card not found' });
    }

    res.status(200).json({ success: true, data: storyCard });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create story card
// @route   POST /api/story-cards
// @access  Private
const createStoryCard = async (req, res) => {
  try {
    // Use uploaded file URL or body image URL
    const imageUrl = req.file ? req.file.path : req.body.story_card_image;

    if (!imageUrl) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        try {
          await deleteFromCloudinary(req.file.path);
        } catch (deleteError) {
          console.error('Error cleaning up uploaded file:', deleteError);
        }
      }
      return res.status(400).json({ message: 'Please provide a story card image' });
    }

    const storyCardData = {
      ...req.body,
      story_card_image: imageUrl,
    };

    const storyCard = await Story_Cards.create(storyCardData);
    res.status(201).json({ success: true, data: storyCard });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await deleteFromCloudinary(req.file.path);
      } catch (deleteError) {
        console.error('Error cleaning up uploaded file:', deleteError);
      }
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update story card
// @route   PUT /api/story-cards/:id
// @access  Private
const updateStoryCard = async (req, res) => {
  try {
    const existingStoryCard = await Story_Cards.findById(req.params.id);

    if (!existingStoryCard) {
      // Clean up uploaded file if story card doesn't exist
      if (req.file) {
        try {
          await deleteFromCloudinary(req.file.path);
        } catch (deleteError) {
          console.error('Error cleaning up uploaded file:', deleteError);
        }
      }
      return res.status(404).json({ message: 'Story card not found' });
    }

    // If new image is uploaded, delete old image
    if (req.file) {
      if (existingStoryCard.story_card_image) {
        try {
          await deleteFromCloudinary(existingStoryCard.story_card_image);
        } catch (deleteError) {
          console.error('Error deleting old image:', deleteError);
        }
      }
    }

    // Use uploaded file URL or keep existing or use body image URL
    const imageUrl = req.file 
      ? req.file.path 
      : (req.body.story_card_image || existingStoryCard.story_card_image);

    const updateData = {
      ...req.body,
      story_card_image: imageUrl,
    };

    const storyCard = await Story_Cards.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: storyCard });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await deleteFromCloudinary(req.file.path);
      } catch (deleteError) {
        console.error('Error cleaning up uploaded file:', deleteError);
      }
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete story card
// @route   DELETE /api/story-cards/:id
// @access  Private
const deleteStoryCard = async (req, res) => {
  try {
    const storyCard = await Story_Cards.findById(req.params.id);

    if (!storyCard) {
      return res.status(404).json({ message: 'Story card not found' });
    }

    // Delete image from Cloudinary
    if (storyCard.story_card_image) {
      try {
        await deleteFromCloudinary(storyCard.story_card_image);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError);
        // Continue with deletion even if Cloudinary deletion fails
      }
    }

    await storyCard.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getStoryCards,
  getStoryCard,
  createStoryCard,
  updateStoryCard,
  deleteStoryCard,
};

