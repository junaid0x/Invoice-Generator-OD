# Module 11: Reports & Analytics

## Overview
Built a streamlined Reports & Analytics business center that provides actionable insights into invoice performance, customer revenue generation, and top-level metrics. The module deliberately avoids over-complex, dashboard-heavy layouts to focus strictly on what matters for the business owner.

## Files Created
- `server/services/reportsService.js`: Contains robust aggregation logic to pull summary cards, invoice statistics, top customers, and a revenue breakdown directly from SQL, avoiding slow in-memory math.
- `server/controllers/reportsController.js`: Express controller handling dynamic date ranges and responding with clean JSON.
- `server/routes/reportsRoutes.js`: Defines `/api/reports` and `/api/reports/revenue` endpoints.
- `client/src/pages/Reports.jsx`: The comprehensive frontend view containing the Filter Bar, Summary Cards, Invoice Statistics, Top Customers table, and Recharts-based visual graphs.
- `project-management/modules/Module11.md`: This documentation file.

## Components Created
- Added `recharts` to the frontend `package.json`.
- Designed `Reports.jsx` combining existing components (`Card`, `PageHeader`, `TableContainer`) and `recharts` to build a seamless UI.

## Routes Created
- `GET /api/reports`: Accepts optional `startDate` and `endDate` query parameters to aggregate data for the summary, stats, and top customers.
- `GET /api/reports/revenue`: Fetches revenue grouped by month for the current year, exclusively counting invoices marked as `paid`.

## Analytics Logic
- **Summary Cards**:
  - `Total Revenue`: Sum of `total` for `paid` invoices.
  - `Outstanding Amount`: Sum of `total` for `pending` and `overdue` invoices combined.
  - `Overdue Amount`: Sum of `total` for `pending` invoices where `due_date < CURRENT_DATE()`.
- **Top Customers**: Grouped by `customer_id`, summing only `paid` invoices, descending by revenue, limit 5.
- **Date Filtering**: Supports dynamic ranges (Today, This Week, This Month, This Year, Custom Range) injected gracefully into SQL queries using parameterized `WHERE` statements to avoid SQL injection.

## Architectural Decisions
- **Read-Only**: Reports logic is strictly read-only. It queries the `invoices`, `customers`, and `settings` tables dynamically, preventing duplicate data.
- **SQL Aggregation**: All aggregation happens in the MySQL layer (`SUM`, `COUNT`, `GROUP BY`) rather than fetching arrays and mapping in Node.js, making the endpoints extremely fast and scalable.
- **Library Choice**: Selected `recharts` for simple, professional, and accessible SVG-based charts without overloading the bundle.
- **No Complex Exports**: Adhered to rules by intentionally omitting CSV/PDF report exports or notification mechanisms.

## Remaining Work
- Module 11 is complete. Stop execution.
