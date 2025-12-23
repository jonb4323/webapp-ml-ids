const logger = require('../../syscalls/index.js');

const verifyRole = (req, res, next) => {
  logger.info('Verifying user role', { userRole: req.user?.role });
  if (req.user && req.user.role === 'admin') { 
    logger.info('User has admin role');
    next(); 
  }
  else { 
    logger.warn('User does not have admin role');
    res.status(403).json({ message: 'Access denied. Admin role required.' }); 
  }
};

module.exports = verifyRole;