const Employee = require('../models/Employee');

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) { return res.status(404).json({ message: 'Employee not found' }); }
    
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Error fetching employee' });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { name, email, position, department } = req.body;
    if (!name || !email || !position || !department) { return res.status(400).json({ message: 'All fields are required' }); }

    const result = await Employee.create({ name, email, position, department });
    res.status(201).json({ message: 'Employee created successfully', employeeId: result.insertId });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Error creating employee' });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, position, department } = req.body;
    if (!name || !email || !position || !department) { return res.status(400).json({ message: 'All fields are required' }); }

    const employee = await Employee.findById(id);
    if (!employee) { return res.status(404).json({ message: 'Employee not found' }); }

    await Employee.update(id, { name, email, position, department });
    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Error updating employee' });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findById(id);
    if (!employee) { return res.status(404).json({ message: 'Employee not found' }); }

    await Employee.delete(id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Error deleting employee' });
  }
};
