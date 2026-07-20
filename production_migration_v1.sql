-- Migration: production_migration_v1.sql
-- Description: Bring production database schema up to the latest version.
-- This migration is idempotent and safe to run multiple times.

DROP PROCEDURE IF EXISTS AddColumnIfNotExists;
DROP PROCEDURE IF EXISTS AddIndexIfNotExists;

DELIMITER //

-- Procedure to safely add columns if they do not exist
CREATE PROCEDURE AddColumnIfNotExists(
    IN tableName VARCHAR(255),
    IN columnName VARCHAR(255),
    IN columnDefinition TEXT
)
BEGIN
    DECLARE columnExists INT;
    SELECT COUNT(*) INTO columnExists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = DATABASE()
      AND table_name = tableName
      AND column_name = columnName;

    IF columnExists = 0 THEN
        SET @query = CONCAT('ALTER TABLE `', tableName, '` ADD COLUMN `', columnName, '` ', columnDefinition);
        PREPARE stmt FROM @query;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

-- Procedure to safely add indexes if they do not exist
CREATE PROCEDURE AddIndexIfNotExists(
    IN tableName VARCHAR(255),
    IN indexName VARCHAR(255),
    IN indexColumns TEXT
)
BEGIN
    DECLARE indexExists INT;
    SELECT COUNT(*) INTO indexExists
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE table_schema = DATABASE()
      AND table_name = tableName
      AND index_name = indexName;

    IF indexExists = 0 THEN
        SET @query = CONCAT('CREATE INDEX `', indexName, '` ON `', tableName, '`(', indexColumns, ')');
        PREPARE stmt FROM @query;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

DELIMITER ;

-- ==========================================
-- 1. ALTER TABLE: settings
-- Adding columns from Modules 10-13 updates
-- ==========================================
CALL AddColumnIfNotExists('settings', 'company_website', 'VARCHAR(255)');
CALL AddColumnIfNotExists('settings', 'primary_color', 'VARCHAR(50) DEFAULT ''#8B3DFF''');
CALL AddColumnIfNotExists('settings', 'secondary_color', 'VARCHAR(50) DEFAULT ''#0B0416''');
CALL AddColumnIfNotExists('settings', 'default_notes', 'TEXT');
CALL AddColumnIfNotExists('settings', 'invoice_prefix', 'VARCHAR(50) DEFAULT ''OD-''');
CALL AddColumnIfNotExists('settings', 'starting_number', 'INT DEFAULT 1');
CALL AddColumnIfNotExists('settings', 'smtp_host', 'VARCHAR(255)');
CALL AddColumnIfNotExists('settings', 'smtp_port', 'VARCHAR(10)');
CALL AddColumnIfNotExists('settings', 'smtp_username', 'VARCHAR(255)');
CALL AddColumnIfNotExists('settings', 'smtp_password', 'VARCHAR(255)');
CALL AddColumnIfNotExists('settings', 'sender_email', 'VARCHAR(255)');

-- ==========================================
-- 2. ALTER TABLE: invoices
-- Adding currency column
-- ==========================================
CALL AddColumnIfNotExists('invoices', 'currency', 'VARCHAR(10) DEFAULT ''CAD''');

-- ==========================================
-- 3. CREATE INDEX: customers
-- Adding performance indexes
-- ==========================================
CALL AddIndexIfNotExists('customers', 'idx_customer_email', 'email');
CALL AddIndexIfNotExists('customers', 'idx_customer_company_name', 'company_name');

-- ==========================================
-- 4. CREATE INDEX: invoices
-- Adding performance indexes
-- ==========================================
CALL AddIndexIfNotExists('invoices', 'idx_invoice_customer_id', 'customer_id');
CALL AddIndexIfNotExists('invoices', 'idx_invoice_status', 'status');
CALL AddIndexIfNotExists('invoices', 'idx_invoice_due_date', 'due_date');

-- ==========================================
-- 5. CREATE INDEX: invoice_items
-- Adding performance indexes
-- ==========================================
CALL AddIndexIfNotExists('invoice_items', 'idx_invoice_items_invoice_id', 'invoice_id');

-- ==========================================
-- 6. CLEANUP
-- Drop the temporary procedures
-- ==========================================
DROP PROCEDURE IF EXISTS AddColumnIfNotExists;
DROP PROCEDURE IF EXISTS AddIndexIfNotExists;
