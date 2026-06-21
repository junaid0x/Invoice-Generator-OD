# Module 06 Report

## Objective
Build the foundational invoice management module responsible for viewing, duplicating, deleting, status-managing, and searching invoices ahead of the full builder implementation in Module 07.

## Dependencies installed
- No new dependencies were installed. Relied on the established Express, MySQL2, React, Tailwind and Zustand ecosystems.

## Files created
- **Backend:**
  - `server/services/invoiceService.js` - Contains business logic for automatic invoice number generation (e.g. `OD-YYYY-0001`), database JOINs to map customer names, duplicating logic, and transactional creation logic.
  - `server/controllers/invoiceController.js` - REST wrapper over the service layer.
  - `server/routes/invoiceRoutes.js` - Endpoint bindings mapped inside `server.js`.
- **Frontend:**
  - `client/src/services/invoiceService.js` - Orchestrates outgoing fetch requests using `api.js`.
  - `client/src/pages/Invoices.jsx` - Main view implementing complex real-time search, robust pill-style filtering, and inline select elements for rapid status updates.
  - `client/src/pages/InvoiceBuilder.jsx` - A temporary placeholder view that "Edit" and "Create Invoice" buttons elegantly navigate to.

## API routes created
- `GET /api/invoices` - Fetch all invoices
- `GET /api/invoices/:id` - Fetch invoice by ID including its items
- `POST /api/invoices` - Create a new invoice (handles auto numbering and items via transactions)
- `PUT /api/invoices/:id` - Edit invoice (currently utilized heavily for `Manage statuses`)
- `DELETE /api/invoices/:id` - Delete an invoice
- `POST /api/invoices/:id/duplicate` - Duplicate existing invoice data into a new draft

## Components created
- **Invoices Page**: Reused `TableContainer`, `DeleteModal`, `EmptyState`, and `LoadingSkeleton`.
- **InvoiceBuilder Page**: A clean, centered placeholder graphic conforming to Ocean Developers branding.

## Business flow
1. Upon loading `Invoices.jsx`, it fetches records and displays them in a table.
2. The UI allows real-time local filtering across `Invoice Number` and `Customer Name` alongside `Status` pills (Draft, Pending, Paid, Overdue, Cancelled).
3. The table includes an inline dropdown to change the status of an invoice quickly without leaving the page.
4. "Duplicate" executes a backend function that retrieves the old invoice, resets the date and status to Draft, auto-generates a new OD-YYYY-0001 number, and saves it seamlessly.
5. "Create Invoice" and "Edit" simply route the user to `/invoice-builder` where the Module 07 placeholder awaits.

## Architectural decisions
- **Automatic Number Generation**: Pushed to the backend service (`invoiceService.js`). It reads the current year and safely polls the highest existing invoice using `LIKE 'OD-YYYY-%'` to guarantee sequential scaling even across rapid insertions.
- **Transactional Writes**: Insertions into `invoices` and `invoice_items` are wrapped in an SQL transaction (`BEGIN`, `COMMIT`, `ROLLBACK`) to prevent orphaned rows if an error occurs mid-creation.
- **Status Management**: Placed inline into the table (`<select>`) as this provides the fastest user experience for an administrator handling payment flows.

## Remaining work
- Module 06 is fully operational. Awaiting instructions for Module 07 to build out the full `InvoiceBuilder` UI and logic.
