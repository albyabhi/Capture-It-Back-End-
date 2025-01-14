const mongoose = require('mongoose');

const imageUploadSchema = new mongoose.Schema({
  room_code: {
    type: String,
    required: true, 
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  image_url: {
    type: String,
    required: true,
  },
});

const ImageUpload = mongoose.model('ImageUpload', imageUploadSchema);

module.exports = ImageUpload;
