const express = require('express');
const router = express.Router();
const ImageUpload = require('../models/ImageUpload');
const cloudinary = require('../config/cloudinaryConfig');
const multer = require('../Middleware/multer');
const verifyToken = require('../Middleware/verifyToken');


router.post('/upload', verifyToken, multer.array('images', 10), async (req, res) => {
  console.log('Files received:', req.files);  // Log all uploaded files
  const eventCode = req.body.eventCode;
  const userId = req.userId;

  console.log('Received eventCode:', eventCode);

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  try {
    const uploadPromises = req.files.map(file =>
      cloudinary.uploader.upload(file.path)
    );

    // Wait for all uploads to finish
    const results = await Promise.all(uploadPromises);

    // For each result, save a separate document for each image
    const imageSavePromises = results.map(async (result) => {
      const imageUpload = new ImageUpload({
        room_code: eventCode,
        user: userId,
        image_url: result.secure_url, // Save the individual image URL
      });

      // Save the image
      await imageUpload.save();
    });

    // Wait for all image documents to be saved
    await Promise.all(imageSavePromises);

    console.log('Images uploaded and saved to MongoDB');
    res.status(200).json({ message: 'Images uploaded successfully' });
  } catch (error) {
    console.log('Error uploading to Cloudinary:', error);
    res.status(500).json({ message: 'Error uploading images', error });
  }
});

router.get('/fetchImages/:roomCode', async (req, res) => {
  const { roomCode } = req.params;

  try {
    
    const images = await ImageUpload.find({ room_code: roomCode })
      .populate('user', 'username')  // Populate user details (optional)
      .sort({ timestamp: -1 }); // Sort by timestamp in descending order

    if (images.length === 0) {
      return res.status(404).json({ message: 'No images found for this room code' });
    }

    res.status(200).json(images);
  } catch (error) {
    console.log('Error fetching images:', error);
    res.status(500).json({ message: 'Error fetching images', error });
  }
});


module.exports = router;
