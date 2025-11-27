const jwt = require('jsonwebtoken');
const config = require('../../config/config');

const sessionOrJwtMiddleware = (req, res, next) => {
  // Check if session exists
  if (req.session && req.session.userId) {
    req.user = {
      id: req.session.userId,
      role: req.session.userRole
    };
    return next();
  }

  // Check for JWT token
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = decoded;
      return next();
    } catch (error) { return res.status(401).json({ message: 'Invalid or expired token' }); }
  }

  return res.status(401).json({ message: 'No session or token provided' });
};

module.exports = sessionOrJwtMiddleware;
