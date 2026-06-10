const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const router = express.Router();
const ImageUpload = require('../models/ImageUpload');
const User = require('../models/UserSchema');
const cloudinary = require('../config/cloudinaryConfig');
const multer = require('../Middleware/multer');
const verifyToken = require('../Middleware/verifyToken');

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: 'Too many uploads, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/upload', verifyToken, uploadLimiter, multer.array('images', 10), async (req, res) => {
  const eventCode = req.body.eventCode;
  const userId = req.userId;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.no_photos <= 0) {
      return res.status(403).json({ message: 'Photo upload limit reached.' });
    }
    if (req.files.length > user.no_photos) {
      return res.status(400).json({ message: `You can only upload ${user.no_photos} more photos.` });
    }

    const uploadPromises = req.files.map(file =>
      cloudinary.uploader.upload(file.path, { folder: 'capture-it' })
    );

    const results = await Promise.all(uploadPromises);

    const imageSavePromises = results.map(async (result) => {
      const imageUpload = new ImageUpload({
        room_code: eventCode,
        user: userId,
        image_url: result.secure_url,
      });
      await imageUpload.save();
    });

    await Promise.all(imageSavePromises);

    user.no_photos -= req.files.length;
    await user.save();

    req.files.forEach(file => {
      fs.unlink(file.path, (err) => {
        if (err) console.error('Failed to delete temp file:', file.path);
      });
    });

    res.status(200).json({ message: 'Images uploaded successfully' });
  } catch (error) {
    console.log('Error uploading to Cloudinary:', error);
    req.files.forEach(file => {
      fs.unlink(file.path, () => {});
    });
    res.status(500).json({ message: 'Error uploading images', error });
  }
});

router.get('/fetchImages/:roomCode', async (req, res) => {
  const { roomCode } = req.params;

  try {
    const images = await ImageUpload.find({ room_code: roomCode })
      .populate('user', 'fullName')
      .sort({ timestamp: -1 });

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
