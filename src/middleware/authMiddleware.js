const jwt = require('jsonwebtoken');
const logger = require('../../syscalls/index.js');

const authMiddleware = (req, res, next) => {
  try {
    logger.info('Authenticating user', { headers: req.headers });
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) { return res.status(401).json({ message: 'No token provided' }); }

    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    // Populate context
    const store = require('../utils/context.js').getStore();
    if (store) store.user = decoded;
    
    next();
  } catch (error) { 
    logger.error('Error authenticating user', { error });
    return res.status(401).json({ message: 'Invalid or expired token' }); 
  }
};

module.exports = authMiddleware;
 