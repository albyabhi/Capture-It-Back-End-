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


// ============================================================
// PURPOSE: Defines the structure of an uploaded image record in the database.
// HOW IT WORKS:
//   Each time a user uploads a photo, an ImageUpload document is created with:
//   - room_code: Which room this image belongs to.
//   - user: A reference (ID) to the User who uploaded it.
//   - timestamp: When the image was uploaded (auto-set to now).
//   - image_url: The Cloudinary URL where the image is stored online.
//   This acts as a bridge between rooms, users, and their images.
//   When fetching images for a room, this model is queried and the
//   "user" field is populated to show who uploaded each photo.
// ============================================================
