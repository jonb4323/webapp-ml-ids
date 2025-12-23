const logger = require('../../syscalls/index.js');
const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    logger.info('Checking user role', { requiredRole, userRole: req.user?.role });
    if (!req.user) { return res.status(401).json({ message: 'User not authenticated' }); }
    if (req.user.role !== requiredRole && requiredRole !== '*') {
      logger.warn('Access denied', { requiredRole, userRole: req.user?.role });
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

module.exports = roleMiddleware;
