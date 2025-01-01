const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');

// Secret key for JWT token (same as used during sign-in)
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  // Get token from Authorization header (format: "Bearer <token>")
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided.' });
  }

  try {
    // Verify token and decode user data
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;  // Attach decoded user info to the request object
    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Invalid token:', error);
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;
