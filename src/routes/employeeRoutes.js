// Employee routes
const express = require('express');
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');
const sessionOrJwtMiddleware = require('../middleware/sessionOrJwt');

const verifyRole = require('../middleware/verifyRole');

const router = express.Router();

// Apply middleware to all routes
router.use(sessionOrJwtMiddleware);

router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', verifyRole, employeeController.deleteEmployee);

module.exports = router;
