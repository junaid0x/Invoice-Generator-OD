const fs = require('fs');
const path = require('path');
const db = require('./database/db');
require('dotenv').config();

async function runMigration() {
  try {
    const migrationFile = process.argv[2] || 'production_migration_v4.sql';
    const migrationPath = path.join(__dirname, '..', migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Executing ${migrationFile} (${statements.length} statements)...`);

    for (let i = 0; i < statements.length; i++) {
      try {
        await db.query(statements[i]);
        console.log(`Statement ${i + 1} executed successfully.`);
      } catch (err) {
        // Ignore duplicate column/index errors
        if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_KEYNAME' || err.errno === 1060 || err.errno === 1061) {
          console.log(`Statement ${i + 1} skipped (already exists).`);
        } else {
          console.error(`Error executing statement ${i + 1}:`, err.message);
        }
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

