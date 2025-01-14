const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) return res.status(401).send('Access denied.');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;  // Ensure this matches the data you need in user-data route
    next();
  } catch (err) {
    return res.status(401).send('Invalid token.');
  }
};

module.exports = verifyToken;
