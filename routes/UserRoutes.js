const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/UserSchema'); // Import the User model

// Secret key for JWT token (should be stored in environment variables for security)
const JWT_SECRET = process.env.JWT_SECRET;

// Function to generate JWT token
const generateToken = (userId) => {
    console.log('JWT_SECRET inside generateToken:', process.env.JWT_SECRET); // Log to check value inside function
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });  // Token expires in 1 hour
  };
  

// User Login Route
router.post('/login', async (req, res) => {
  const { fullName, eventCode } = req.body;
  console.log('JWT_SECRET:', process.env.JWT_SECRET);


  // Validate the request body
  if (!fullName || !eventCode) {
    return res.status(400).json({ message: 'Full name and event code are required.' });
  }

  try {
    // Check if the user already exists
    let user = await User.findOne({ fullName, eventCode });

    if (user) {
      // If the user already exists, generate a token
      const token = generateToken(user._id);
      return res.status(200).json({ message: 'User already exists.', user, token });
    }

    // If the user doesn't exist, create a new user
    user = new User({ fullName, eventCode });
    await user.save();

    console.log('User saved:', user);

    // Generate a token for the newly created user
    const token = generateToken(user._id);

    return res.status(201).json({ message: 'User logged in successfully.', user, token });
  } catch (error) {
    console.error('Error saving user:', error);
    return res.status(500).json({ message: 'An error occurred while saving the user.', error });
  }
});

module.exports = router;
