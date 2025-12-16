const pool = require('../utils/db');

class Employee {
  static async findAll() {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT * FROM employees');
      connection.release();
      return rows;
    } catch (error) {
      console.error('Error finding all employees:', error);
      throw error;
    }
  }

  static async findByUser(userId) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT * FROM employees WHERE created_by = ?', [userId]);
      connection.release();
      return rows;
    } catch (error) {
      console.error('Error finding employees by user:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT * FROM employees WHERE id = ?', [id]);
      connection.release();
      return rows[0];
    } catch (error) {
      console.error('Error finding employee by id:', error);
      throw error;
    }
  }

  static async create(employee) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'INSERT INTO employees (name, email, position, department, salary, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [employee.name, employee.email, employee.position, employee.department, employee.salary, employee.created_by]
      );
      connection.release();
      return result;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  static async update(id, employee) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'UPDATE employees SET name = ?, email = ?, position = ?, department = ?, salary = ? WHERE id = ?',
        [employee.name, employee.email, employee.position, employee.department, employee.salary, id]
      );
      connection.release();
      return result;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query('DELETE FROM employees WHERE id = ?', [id]);
      connection.release();
      return result;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }
}

module.exports = Employee;
