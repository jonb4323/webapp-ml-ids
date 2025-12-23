const pool = require('../utils/db');
const logger = require('../../syscalls/index.js');

class Employee {
  static async findAll() {
    try {
      logger.info('Finding all employees');
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT * FROM employees');
      connection.release();
      return rows;
    } catch (error) {
      logger.error('Error finding all employees', { error });
      console.error('Error finding all employees:', error);
      throw error;
    }
  }

  static async findByUser(userId) {
    try {
      logger.info('Finding employees by user', { userId });
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT * FROM employees WHERE created_by = ?', [userId]);
      connection.release();
      return rows;
    } catch (error) {
      logger.error('Error finding employees by user', { error });
      console.error('Error finding employees by user:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      logger.info('Finding employee by id', { id });
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT * FROM employees WHERE id = ?', [id]);
      connection.release();
      return rows[0];
    } catch (error) {
      logger.error('Error finding employee by id', { error });
      console.error('Error finding employee by id:', error);
      throw error;
    }
  }

  static async create(employee) {
    try {
      logger.info('Creating employee', { employee });
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'INSERT INTO employees (name, email, position, department, salary, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [employee.name, employee.email, employee.position, employee.department, employee.salary, employee.created_by]
      );
      connection.release();
      return result;
    } catch (error) {
      logger.error('Error creating employee', { error });
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  static async update(id, employee) {
    try {
      logger.info('Updating employee', { id, employee });
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'UPDATE employees SET name = ?, email = ?, position = ?, department = ?, salary = ? WHERE id = ?',
        [employee.name, employee.email, employee.position, employee.department, employee.salary, id]
      );
      connection.release();
      return result;
    } catch (error) {
      logger.error('Error updating employee', { error });
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      logger.info('Deleting employee', { id });
      const connection = await pool.getConnection();
      const [result] = await connection.query('DELETE FROM employees WHERE id = ?', [id]);
      connection.release();
      return result;
    } catch (error) {
      logger.error('Error deleting employee', { error });
      console.error('Error deleting employee:', error);
      throw error;
    }
  }
}

module.exports = Employee;
