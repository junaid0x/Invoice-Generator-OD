const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ocean_invoice_suite'
    });
    console.log('Success connecting to DB');
    await connection.end();
  } catch (err) {
    console.error('Connection failed:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('MySQL server is not running on the specified port. Please start MySQL/XAMPP.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied for user root. Please check the DB_PASSWORD in .env.');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('Database ocean_invoice_suite does not exist. Please create it or run the migration script.');
    }
  }
}

testConnection();
