const fs = require('fs');
const path = require('path');
const db = require('./database/db');
require('dotenv').config();

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, '..', 'production_migration_v3.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons and remove empty lines
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    console.log(`Found ${statements.length} statements to execute.`);
    
    for (let i = 0; i < statements.length; i++) {
      console.log(`Executing statement ${i + 1}...`);
      await db.query(statements[i]);
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
