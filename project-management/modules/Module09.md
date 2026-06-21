# Module 09: Business Dashboard

## Overview
Built a simple, elegant, and informative business dashboard to provide a high-level overview of key business metrics without being a full analytics platform.

## Files Created
- `server/services/dashboardService.js`: Encapsulates business logic and SQL queries for aggregating dashboard stats.
- `server/controllers/dashboardController.js`: Express controller handling the `/api/dashboard` route.
- `server/routes/dashboardRoutes.js`: Defines the router and protects the dashboard endpoint with `verifyToken`.
- `project-management/modules/Module09.md`: This documentation file.

## Files Modified
- `server/server.js`: Mounted the `dashboardRoutes` on `/api/dashboard`.
- `client/src/pages/Dashboard.jsx`: Redesigned the entire component to fetch data from the API and display the required metrics and quick actions.

## Business Logic
- **Overdue Logic**: Invoices are considered overdue if their `status` is `'pending'` and their `due_date` is earlier than the current date. This is computed dynamically in the SQL query (`status = 'pending' AND due_date < CURRENT_DATE()`), avoiding duplicate business logic or extra tables.
- **Total Revenue**: Sums up the `total` of all invoices where `status` is `'paid'`. Unpaid invoices do not count towards total revenue.
- **Top Stats**: Fetches counts of total customers, total invoices, pending invoices, overdue invoices, and the total revenue.
- **Recent Data**: Fetches the 5 most recent invoices (joining the customers table for the company name) and the 5 most recent customers.

## Architectural Decisions
- Created a single aggregate API endpoint (`GET /api/dashboard`) to serve all the dashboard data in one request. This is more efficient than making separate requests for each stat card and table.
- Maintained the rule that the dashboard is a summary layer and does not own data. All queries are read-only (`SELECT`).
- Used the existing Ocean Developers design language with elegant spacing, soft colors, and consistent `Card` and `TableContainer` components.

## Remaining Work
- Module 09 is complete. Stop execution.
