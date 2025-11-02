const mongoose = require('mongoose');

const SiteDetailsSchema = new mongoose.Schema({
  site_name: {
    type: String,
    required: [true, 'Please provide site name'],
    trim: true,
  },
  site_tagline: {
    type: String,
    trim: true,
  },
  site_url: {
    type: String,
    required: [true, 'Please provide site URL'],
    trim: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  hero_slide_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hero_Slides',
  }],
  product_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products',
  }],
  story_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
  }],
  category_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Site_Details', SiteDetailsSchema);

