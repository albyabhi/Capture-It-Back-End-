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


// ============================================================
// PURPOSE: Protects private routes by checking if the user has a valid login token.
// HOW IT WORKS:
//   1. Reads the "Authorization" header from the request.
//   2. Extracts the token (removes the "Bearer " prefix).
//   3. If no token exists, returns 401 (unauthorized).
//   4. Uses jwt.verify() to check if the token is real and not expired.
//   5. If valid, extracts the userId from the token and attaches it
//      to req.userId so later code knows WHO is making the request.
//   6. Calls next() to let the request continue to the actual route.
// ============================================================
