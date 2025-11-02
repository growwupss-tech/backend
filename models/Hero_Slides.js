const mongoose = require('mongoose');

const HeroSlidesSchema = new mongoose.Schema({
  tagline: {
    type: String,
    required: [true, 'Please provide tagline'],
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'Please provide image URL'],
    trim: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Hero_Slides', HeroSlidesSchema);

