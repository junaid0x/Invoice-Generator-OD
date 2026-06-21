const db = require('./database/db');
(async () => {
  try {
    await db.query(`ALTER TABLE invoices ADD COLUMN currency VARCHAR(10) DEFAULT 'CAD'`);
    console.log('ALTER success');
  } catch(e) {
    console.log('Error or already added:', e.message);
  }
  process.exit();
})();
