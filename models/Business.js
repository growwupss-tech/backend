const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  business_name: {
    type: String,
    required: [true, 'Please provide business name'],
    trim: true,
  },
  business_tagline: {
    type: String,
    trim: true,
  },
  business_email_add: {
    type: String,
    required: [true, 'Please provide business email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  site_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site_Details',
    required: false,
  },
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Please provide seller ID'],
  },
  template_id: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Business', BusinessSchema);

