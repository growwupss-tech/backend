const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  category_name: {
    type: String,
    required: [true, 'Please provide category name'],
    trim: true,
    unique: true,
  },
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Category', CategorySchema);

