const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  business_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: [true, 'Please provide business ID'],
  },
  product_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products',
  }],
  // Additional analytics fields can be added here
  views: {
    type: Number,
    default: 0,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);

