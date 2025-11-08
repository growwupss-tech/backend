const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String },
  resource_type: { type: String },
}, { _id: false });

const UploadSchema = new mongoose.Schema({
  files: [FileSchema],
  uploadedBy: {
    // optional reference if you want to associate uploads with a user
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Upload', UploadSchema);
