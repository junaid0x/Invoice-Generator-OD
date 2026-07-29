const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDb() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log("Setting up database ocean_invoice_suite...");
    await connection.query("CREATE DATABASE IF NOT EXISTS `ocean_invoice_suite` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    await connection.query("USE `ocean_invoice_suite`;");
    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");

    // 1. users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(50) DEFAULT 'user',
        \`is_active\` BOOLEAN DEFAULT TRUE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. customers
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`customers\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`company_name\` VARCHAR(255) NOT NULL,
        \`contact_person\` VARCHAR(255),
        \`email\` VARCHAR(255),
        \`phone\` VARCHAR(50),
        \`address\` TEXT,
        \`city\` VARCHAR(100),
        \`province\` VARCHAR(100),
        \`country\` VARCHAR(100),
        \`postal_code\` VARCHAR(20),
        \`notes\` TEXT,
        \`is_demo\` TINYINT(1) NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. invoices
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`invoices\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`invoice_number\` VARCHAR(50) NOT NULL UNIQUE,
        \`customer_id\` INT NOT NULL,
        \`invoice_date\` DATE NOT NULL,
        \`due_date\` DATE,
        \`currency\` VARCHAR(10) DEFAULT 'CAD',
        \`payment_terms\` VARCHAR(100),
        \`po_number\` VARCHAR(100),
        \`subtotal\` DECIMAL(10, 2) DEFAULT 0.00,
        \`advance_amount\` DECIMAL(10, 2) DEFAULT 0.00,
        \`tax\` DECIMAL(10, 2) DEFAULT 0.00,
        \`discount\` DECIMAL(10, 2) DEFAULT 0.00,
        \`shipping\` DECIMAL(10, 2) DEFAULT 0.00,
        \`total\` DECIMAL(10, 2) DEFAULT 0.00,
        \`status\` VARCHAR(50) DEFAULT 'draft',
        \`notes\` TEXT,
        \`terms\` TEXT,
        \`is_demo\` TINYINT(1) NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. invoice_items
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`invoice_items\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`invoice_id\` INT NOT NULL,
        \`description\` TEXT NOT NULL,
        \`quantity\` DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
        \`rate\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`amount\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`invoice_id\`) REFERENCES \`invoices\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. settings
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`settings\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`company_name\` VARCHAR(255) NOT NULL,
        \`company_email\` VARCHAR(255),
        \`company_phone\` VARCHAR(50),
        \`company_address\` TEXT,
        \`company_website\` VARCHAR(255),
        \`primary_color\` VARCHAR(50) DEFAULT '#8B3DFF',
        \`secondary_color\` VARCHAR(50) DEFAULT '#0B0416',
        \`default_notes\` TEXT,
        \`invoice_prefix\` VARCHAR(50) DEFAULT 'OD-',
        \`starting_number\` INT DEFAULT 1,
        \`smtp_host\` VARCHAR(255),
        \`smtp_port\` VARCHAR(10),
        \`smtp_username\` VARCHAR(255),
        \`smtp_password\` VARCHAR(255),
        \`sender_email\` VARCHAR(255),
        \`currency\` VARCHAR(10) DEFAULT 'USD',
        \`default_tax\` DECIMAL(5, 2) DEFAULT 0.00,
        \`default_payment_terms\` VARCHAR(100),
        \`logo_url\` VARCHAR(255),
        \`is_demo\` TINYINT(1) NOT NULL DEFAULT 0,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. subscriptions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`subscriptions\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`customer_id\` INT NOT NULL,
        \`service_type\` ENUM('Hosting','Business Email','Website Maintenance') NOT NULL,
        \`service_name\` VARCHAR(255) NOT NULL,
        \`service_identifier\` VARCHAR(255) DEFAULT NULL,
        \`provider\` VARCHAR(255) DEFAULT NULL,
        \`price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        \`purchase_date\` DATE NOT NULL,
        \`renewal_date\` DATE DEFAULT NULL,
        \`contract_start\` DATE DEFAULT NULL,
        \`contract_end\` DATE DEFAULT NULL,
        \`notes\` TEXT DEFAULT NULL,
        \`is_demo\` TINYINT(1) NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. subscription_history
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`subscription_history\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`subscription_id\` INT NOT NULL,
        \`renewal_date\` DATE NOT NULL,
        \`amount\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        \`notes\` TEXT DEFAULT NULL,
        \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`subscription_id\`) REFERENCES \`subscriptions\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Add is_demo columns safely if existing tables didn't have them
    const tables = ['customers', 'invoices', 'subscriptions', 'settings'];
    for (const t of tables) {
      try {
        await connection.query(`ALTER TABLE \`${t}\` ADD COLUMN \`is_demo\` TINYINT(1) NOT NULL DEFAULT 0;`);
      } catch (err) {
        // Ignore duplicate column error
      }
    }

    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("Database and tables verified and initialized successfully!");
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  }
}

initDb();
