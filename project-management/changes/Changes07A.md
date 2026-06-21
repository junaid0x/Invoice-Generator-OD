# Patch 07A Report

## Objective
Refine the Invoice Workspace by eliminating non-essential fields (PO Number, Payment Terms) and introducing comprehensive multi-currency support throughout the application logic, backend, and interface.

## Files modified
- `server/database/schema.sql`
- `server/services/invoiceService.js`
- `client/src/utils/calculations.js`
- `client/src/pages/InvoiceBuilder.jsx`
- `client/src/pages/Invoices.jsx`
- `client/src/components/invoice/InvoiceSummaryCard.jsx`
- `client/src/components/invoice/InvoiceItemsTable.jsx`
- `client/src/components/invoice/InvoiceCalculations.jsx`

## Fields removed
- **PO Number** (`po_number`)
- **Payment Terms** (`payment_terms`)
- *These fields were structurally bypassed in the payloads, state objects, validation rules, and summary cards to simplify the workflow.*

## Currency flow
1. **Selection**: Added a dedicated `<select>` component in `InvoiceSummaryCard` offering `CAD` (default), `USD`, `PKR`, `AED`, `EUR`, and `GBP`.
2. **State Pipeline**: The selected string travels up to `InvoiceBuilder`'s core state and is disseminated down to `InvoiceItemsTable` and `InvoiceCalculations`.
3. **Calculation & Rendering**: `client/src/utils/calculations.js` exposes a `formatCurrency` method utilizing `Intl.NumberFormat`. It dynamically formats numbers based on the selected currency and actively appends exact labels (e.g., `₨5000.00 PKR`, `$1250.00 CAD`, `د.إ 500.00 AED`).
4. **Backend Sync**: Modified `schema.sql` via an `ALTER TABLE` to append `currency VARCHAR(10) DEFAULT 'CAD'` and updated `invoiceService.js` to ensure the currency tag persists in MySQL and not just a temporary JSON blob, aligning correctly with best architectural practices.
5. **Dashboard Reflection**: The `Invoices.jsx` table page now dynamically reads `invoice.currency` upon fetching and styles the Grand Total appropriately without relying on a hardcoded "USD".

## Architectural decisions
- **Schema Permanence over JSON blob**: Rather than hacking a temporary currency tag into a JSON payload which impacts future searchability, aggregation, and indexing, I explicitly appended a typed column (`currency`) onto the existing table. This is infinitely more scalable for a production accounting application.
- **Dynamic Localization**: Relied heavily on `Intl.NumberFormat` instead of raw string manipulation to ensure decimals and commas behave properly according to Western vs Asian standards where applicable, with a custom `switch` wrapper ensuring the user's explicit suffix format (`$1250 CAD`) is rigorously adhered to.
