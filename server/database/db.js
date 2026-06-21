const mysql = require('mysql2/promise');
const config = require('../config/database');
const logger = require('../utils/logger');

const pool = mysql.createPool({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    logger.info('Successfully connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    logger.error(`Error connecting to MySQL database: ${err.message}`);
  });

module.exports = pool;
