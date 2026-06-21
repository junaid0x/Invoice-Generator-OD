const db = require('./database/db');

(async () => {
  try {
    const alters = [
      "ALTER TABLE settings ADD COLUMN company_website VARCHAR(255)",
      "ALTER TABLE settings ADD COLUMN primary_color VARCHAR(50) DEFAULT '#8B3DFF'",
      "ALTER TABLE settings ADD COLUMN secondary_color VARCHAR(50) DEFAULT '#0B0416'",
      "ALTER TABLE settings ADD COLUMN default_notes TEXT",
      "ALTER TABLE settings ADD COLUMN invoice_prefix VARCHAR(50) DEFAULT 'OD-'",
      "ALTER TABLE settings ADD COLUMN starting_number INT DEFAULT 1",
      "ALTER TABLE settings ADD COLUMN smtp_host VARCHAR(255)",
      "ALTER TABLE settings ADD COLUMN smtp_port VARCHAR(10)",
      "ALTER TABLE settings ADD COLUMN smtp_username VARCHAR(255)",
      "ALTER TABLE settings ADD COLUMN smtp_password VARCHAR(255)",
      "ALTER TABLE settings ADD COLUMN sender_email VARCHAR(255)"
    ];

    for (const query of alters) {
      try {
        await db.query(query);
        console.log('Executed:', query);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log('Column already exists, skipping:', query);
        } else {
          console.error('Error executing query:', query, err.message);
        }
      }
    }

    // Seed the first record if it doesn't exist
    try {
      const [rows] = await db.query('SELECT * FROM settings WHERE id = 1');
      if (rows.length === 0) {
        await db.query(`
          INSERT INTO settings (id, company_name, company_email, company_phone, company_address, currency, default_tax, default_payment_terms, logo_url, default_notes)
          VALUES (
            1, 
            'Ocean Developers LTD', 
            'billing@oceandevelopersltd.com', 
            '', 
            '123 Ocean Drive, Suite 100', 
            'CAD', 
            0, 
            'For E-Transfer use\\nfinance@oceandevelopersltd.com\\npassword: Calgary',
            '/OD-Logo.png',
            'This is the electronically generated invoice so no signature is required'
          )
        `);
        console.log('Inserted default settings record');
      }
    } catch (err) {
      console.error('Error seeding settings:', err.message);
    }

    console.log('Database alteration complete.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit();
  }
})();
