const mongoose = require('mongoose');

const SellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide seller name'],
    trim: true,
  },
  phone_number: {
    type: Number,
    required: [true, 'Please provide phone number'],
  },
  whatsapp_number: {
    type: Number,
    required: [true, 'Please provide WhatsApp number'],
  },
  address: {
    type: String,
    required: [true, 'Please provide address'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Seller', SellerSchema);

