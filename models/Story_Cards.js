const mongoose = require('mongoose');

const StoryCardsSchema = new mongoose.Schema({
  story_card_title: {
    type: String,
    required: [true, 'Please provide story card title'],
    trim: true,
  },
  story_card_descript: {
    type: String,
    trim: true,
  },
  story_card_image: {
    type: String,
    required: [true, 'Please provide story card image URL'],
    trim: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Story_Cards', StoryCardsSchema);

