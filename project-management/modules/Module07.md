# Module 07 Report

## Objective
Build the main "Invoice Workspace", which serves as the heart of the application for creating and editing invoices through a professional, heavily modular, and calculation-rich interface without becoming visually overwhelming.

## Files created
- `client/src/utils/calculations.js`
- `client/src/components/invoice/CustomerSelector.jsx`
- `client/src/components/invoice/CustomerInfoCard.jsx`
- `client/src/components/invoice/InvoiceItemsTable.jsx`
- `client/src/components/invoice/InvoiceCalculations.jsx`
- `client/src/components/invoice/InvoiceSummaryCard.jsx`
- `client/src/components/invoice/InvoiceNotes.jsx`
- `client/src/components/invoice/InvoiceTerms.jsx`
- `client/src/pages/InvoiceBuilder.jsx`

## Components created
- **CustomerSelector**: A dropdown wrapper with internal fast searching to assign a customer entity without leaving the flow.
- **CustomerInfoCard**: Displays the selected client's company, contact, email, and address seamlessly if selected.
- **InvoiceItemsTable**: A dynamic table supporting dynamic addition/removal of line items, triggering localized field validation styles on errors.
- **InvoiceCalculations**: Holds modifiers (Tax, Discount, Shipping) and reflects total bounds.
- **InvoiceSummaryCard**: Form block capturing meta parameters (Dates, PO, Terms).
- **InvoiceNotes / InvoiceTerms**: Clean multi-line text blocks.
- **InvoiceBuilder**: The orchestration page syncing the state between the components and enforcing a standard layout structure.

## Business flow
1. When mounted, the workspace fetches existing customers for the `CustomerSelector`. If an `id` is present in the URL, it fetches that specific invoice.
2. The user constructs their invoice block by block (Customer -> Info -> Items -> Notes/Terms).
3. The right-hand column tracks the live values in sticky view so the user always sees their `Grand Total`.
4. Using the Action Card, the user selects "Save as Draft" or "Save & Issue Invoice", routing them securely back to `/invoices` upon success.

## Calculation flow
- Decoupled from rendering, the `calculateSubtotal` and `calculateGrandTotal` utilities run efficiently in `utils/calculations.js`.
- During component un-mounting or update ticks across items, `InvoiceBuilder` recalculates via a standard `useEffect` binding to update `invoice.subtotal` and `invoice.total`, ensuring UI state and API-bound payloads are 1:1 synced automatically.

## Validation flow
- Hard-guards before dispatching an HTTP POST/PUT. 
- Prevents submission if `Customer`, `Invoice Date`, `Due Date`, `Description`, `Quantity > 0`, or `Rate > 0` conditions fail. 
- Generates dynamic localized error messaging on an `errors` object, passed down to child components so fields visually mutate (e.g. red outlines).

## Architectural decisions
- **Backend Reusability**: Expanded `updateInvoice` locally in `server/services/invoiceService.js` to execute robust SQL row-purges/re-inserts inside a database transaction to perfectly manage dynamic invoice arrays without API bloating.
- **UI Modularization**: Strictly divided the large monolithic form into 7 self-contained UI chunks to ensure the page remains scalable.
- **State Management**: Lifted the invoice payload entirely up to the `InvoiceBuilder` parent, streaming changes downwards through controlled prop updates to keep a single source of truth without requiring global Zustand pollution.

## Remaining work
- Module 07 requirements are completed. Ready for PDF rendering logic in Module 08.
