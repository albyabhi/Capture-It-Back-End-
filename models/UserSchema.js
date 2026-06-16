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


// ============================================================
// PURPOSE: Defines the structure of a "User" in the database.
// HOW IT WORKS:
//   A User represents someone who joined an event room. It has:
//   - fullName: The person's name (e.g., "John Smith").
//   - eventCode: The room code they joined (links them to a room).
//   - no_photos: How many photos they can still upload (starts at 25).
//   - timestamps: Auto-creates "createdAt" and "updatedAt" fields.
//   Mongoose creates a "users" collection in MongoDB. The no_photos
//   field is decremented each time the user uploads images, acting
//   as a per-user upload quota.
// ============================================================
