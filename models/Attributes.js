const mongoose = require('mongoose');

const AttributesSchema = new mongoose.Schema({
  attribute_name: {
    type: String,
    required: [true, 'Please provide attribute name'],
    trim: true,
  },
  options: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Attributes', AttributesSchema);

