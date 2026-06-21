const db = require('./db');
const logger = require('../utils/logger');

const addIndexes = async () => {
  const queries = [
    'CREATE INDEX idx_customer_email ON customers(email);',
    'CREATE INDEX idx_customer_company_name ON customers(company_name);',
    'CREATE INDEX idx_invoice_customer_id ON invoices(customer_id);',
    'CREATE INDEX idx_invoice_status ON invoices(status);',
    'CREATE INDEX idx_invoice_due_date ON invoices(due_date);',
    'CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);'
  ];

  logger.info('Starting database index optimization...');

  for (const q of queries) {
    try {
      await db.query(q);
      logger.info(`Successfully executed: ${q}`);
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        logger.warn(`Index already exists, skipping: ${q}`);
      } else {
        logger.error(`Failed to execute: ${q}`, err);
      }
    }
  }

  logger.info('Database index optimization complete.');
  process.exit(0);
};

addIndexes();
