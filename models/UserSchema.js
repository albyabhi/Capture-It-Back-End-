const mongoose = require('mongoose');

// Define the User Schema
const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    eventCode: {
      type: String,
      required: true,
      trim: true,
    },
    no_photos: {
      type: Number,
      default: 25, // Default value is 25
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Create and export the User model
const User = mongoose.model('User', UserSchema);
module.exports = User;
