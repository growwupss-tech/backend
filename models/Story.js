const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  story_title: {
    type: String,
    required: [true, 'Please provide story title'],
    trim: true,
  },
  is_visible: {
    type: Boolean,
    default: true,
  },
  story_card_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story_Cards',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Story', StorySchema);

