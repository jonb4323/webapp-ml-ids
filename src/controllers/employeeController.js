const Employee = require('../models/Employee');
const logger = require('../../syscalls/index.js');

exports.getAllEmployees = async (req, res) => {
  try {
    logger.info('Fetching all employees');
    // Check user role - admins see all, users see only their own
    let employees;
    if (req.user.role === 'admin') { employees = await Employee.findAll(); }
    else { employees = await Employee.findByUser(req.user.id); }
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    logger.info('Fetching employee by ID', { id: req.params.id });
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) { return res.status(404).json({ message: 'Employee not found' }); }
    
    // Check if user has permission to view this employee
    if (req.user.role !== 'admin' && employee.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Error fetching employee' });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    logger.info('Creating employee', { body: req.body });
    const { name, email, position, department, salary } = req.body;
    if (!name || !email || !position || !department) { return res.status(400).json({ message: 'All fields are required' }); }

    const result = await Employee.create({ 
      name, 
      email, 
      position, 
      department,
      salary: salary || 0,
      created_by: req.user.id 
    });
    res.status(201).json({ message: 'Employee created successfully', employeeId: result.insertId });
    logger.info('Employee created successfully', { employeeId: result.insertId });
  } catch (error) {
    logger.error('Error creating employee', { error });
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Error creating employee' });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    logger.info('Updating employee', { body: req.body });
    const { id } = req.params;
    const { name, email, position, department, salary } = req.body;
    if (!name || !email || !position || !department) { return res.status(400).json({ message: 'All fields are required' }); }

    const employee = await Employee.findById(id);
    if (!employee) { return res.status(404).json({ message: 'Employee not found' }); }

    await Employee.update(id, { name, email, position, department, salary: salary || 0 });
    res.json({ message: 'Employee updated successfully' });
    logger.info('Employee updated successfully', { employeeId: id });
  } catch (error) {
    logger.error('Error updating employee', { error });
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Error updating employee' });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    logger.info('Deleting employee', { body: req.body });
    const { id } = req.params;
    
    const employee = await Employee.findById(id);
    if (!employee) { return res.status(404).json({ message: 'Employee not found' }); }

    await Employee.delete(id);
    res.json({ message: 'Employee deleted successfully' });
    logger.info('Employee deleted successfully', { employeeId: id });
  } catch (error) {
    logger.error('Error deleting employee', { error });
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Error deleting employee' });
  }
};
