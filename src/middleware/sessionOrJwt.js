const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const logger = require('../../syscalls/index.js');

const sessionOrJwtMiddleware = (req, res, next) => {
  logger.info('Checking session/JWT', { headers: req.headers });
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
    logger.info('Checking JWT token', { token });
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = decoded;
      return next();
    } catch (error) { 
      logger.error('Invalid or expired token', { error });
      return res.status(401).json({ message: 'Invalid or expired token' }); 
    }
  }

  logger.warn('No session or token provided');
  return res.status(401).json({ message: 'No session or token provided' });
};

module.exports = sessionOrJwtMiddleware;
