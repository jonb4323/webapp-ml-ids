const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function initDb() {
  try {
    const connection = await pool.getConnection();
    
    console.log('Initializing database from schema.sql...');
    
    // Read schema.sql file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split into individual statements (basic splitting by semicolon)
    // Filter out empty statements
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
      
    for (const statement of statements) {
      await connection.query(statement);
    }
    
    console.log('Database initialized successfully');
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initDb();
