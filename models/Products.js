const mongoose = require('mongoose');

const ProductsSchema = new mongoose.Schema({
  images: [{
    type: String,
    trim: true,
  }],
  product_name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
  },
  product_descriptio: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
    min: 0,
  },
  is_visible: {
    type: Boolean,
    default: true,
  },
  inventory: {
    type: String,
    default: 'In Stock',
    trim: true,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide category ID'],
  },
  attribute_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attributes',
  }],
  visits: {
    type: Number,
    default: 0,
  },
  redirects: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Products', ProductsSchema);

