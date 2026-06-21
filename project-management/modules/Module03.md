# Module 03 Report

## Objective
Build the entire database foundation of the application, preparing everything future modules will use. This module sets up the database, schema, connection, environment variables, and essential backend infrastructure.

## Dependencies installed
- `mysql2`: A MySQL client for Node.js with focus on performance and prepared statements support.
- `dotenv`: A zero-dependency module that loads environment variables from a `.env` file into `process.env`.

## Database created
- Database name: `ocean_invoice_suite`
- Collation: `utf8mb4_unicode_ci`

## Files created
- `server/.env`
- `server/database/db.js`
- `server/config/database.js`
- `server/utils/logger.js`
- `server/middleware/errorHandler.js`
- `server/middleware/notFound.js`
- `server/database/schema.sql`

## Tables created
- `users`
- `customers`
- `invoices`
- `invoice_items`
- `settings`
- `activity_logs`

## Indexes created
- `idx_customer_id` on `invoices`
- `idx_invoice_id` on `invoice_items`
- `idx_user_id` on `activity_logs`
- `idx_invoice_status` on `invoices`

## Foreign keys created
- `invoices(customer_id)` referencing `customers(id)` (ON DELETE RESTRICT)
- `invoice_items(invoice_id)` referencing `invoices(id)` (ON DELETE CASCADE)
- `activity_logs(user_id)` referencing `users(id)` (ON DELETE SET NULL)

## Architectural decisions
- Used a reusable connection pool in `server/database/db.js` using `mysql2/promise` to efficiently manage database connections.
- Separated database configuration into `server/config/database.js`.
- Implemented robust error handling middleware and standard logging utility.
- Included `IF NOT EXISTS` constructs within `schema.sql` so the file can be executed repeatedly safely and remains the single source of truth for the database schema.

## Remaining work
- No business CRUD functionality built yet as per requirements. Module is completed successfully.
