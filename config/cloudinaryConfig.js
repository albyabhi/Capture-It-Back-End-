const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

module.exports = cloudinary;


// ============================================================
// PURPOSE: Sets up Cloudinary - the cloud service that stores all uploaded images.
// HOW IT WORKS:
//   1. Loads Cloudinary credentials from .env (CLOUD_NAME, API_KEY, API_SECRET).
//   2. Passes them to cloudinary.config() so the SDK knows which
//      Cloudinary account to use.
//   3. Exports the configured cloudinary object, which other files
//      use to upload images (e.g., cloudinary.uploader.upload()).
// ============================================================
