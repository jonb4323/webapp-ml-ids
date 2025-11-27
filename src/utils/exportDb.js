require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function exportDb() {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT * FROM users');
    const [employees] = await connection.query('SELECT * FROM employees');
    connection.release();
    
    const output = `
DATABASE DUMP - ${new Date().toISOString()}
===========================================

USERS TABLE
-----------
${JSON.stringify(users, null, 2)}

EMPLOYEES TABLE
---------------
${JSON.stringify(employees, null, 2)}
    `;
    
    const outputPath = path.join(__dirname, `../../wdatabase-dumps/db_dump.txt`);
    fs.writeFileSync(outputPath, output);
    
    console.log(`Database exported successfully to ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('Error exporting database:', error);
    process.exit(1);
  }
}

exportDb();
