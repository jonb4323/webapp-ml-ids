const User = require('../models/User');
const logger = require('../../syscalls/index.js');

exports.getAllUsers = async (req, res) => {
  try {
    logger.info('Fetching all users');
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    logger.error('Error fetching users', { error });
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.toggleUserRole = async (req, res) => {
  try {
    logger.info('Updating user role', { id: req.params.id, role: req.body.role });
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      logger.warn('Invalid role', { id, role });
      return res.status(400).json({ message: 'Invalid role' });
    }

    await User.changeRole(id, role);
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    logger.error('Error updating user role', { error });
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Error updating user role' });
  }
};
