# Module 05 Report

## Objective
Build a complete, elegant customer management system for the administrator to create, view, edit, delete, and search customers, maintaining the premium Ocean Developers design language.

## Dependencies installed
- No new NPM packages were installed. Leveraging existing robust React frontend, Tailwind, Zustand, and Express/MySQL2 backend setup.

## Files created
- **Backend:**
  - `server/services/customerService.js` - Data layer for querying the MySQL database.
  - `server/controllers/customerController.js` - Request/Response mapping and payload validation.
  - `server/routes/customerRoutes.js` - API routing linked to Auth middleware.
- **Frontend:**
  - `client/src/services/customerService.js` - Frontend communication channel utilizing the secure `api.js` wrapper.
  - `client/src/components/CustomerModal.jsx` - Reusable slide-in dialog for both Adding and Editing clients with pre-filled forms.
  - `client/src/components/DeleteModal.jsx` - Reusable elegant confirmation dialog.
  - `client/src/components/ui/LoadingSkeleton.jsx` - Graceful loading state visualizer.
  - `client/src/pages/Customers.jsx` - The main orchestrator connecting state, search filtering, components, and APIs.

## API routes created
- `GET /api/customers` - Fetch all customers sorted by newest.
- `GET /api/customers/:id` - Fetch single customer.
- `POST /api/customers` - Create new customer.
- `PUT /api/customers/:id` - Edit customer.
- `DELETE /api/customers/:id` - Delete customer.

## Components created
- **CustomerModal**: Multi-purpose form modal.
- **DeleteModal**: Warning modal to prevent accidental drops.
- **LoadingSkeleton**: Pulsing table row structure.

## Business flow
1. User enters the Customers page. `Customers.jsx` mounts and requests data via `customerService.getAll()`.
2. Controller handles request, querying the database through the Service.
3. Loading skeletons mask the retrieval latency.
4. If empty, the `<EmptyState />` elegantly guides the user to create an entry.
5. Search bar applies real-time case-insensitive filtering against Company Name, Contact Person, and Email locally using `useMemo` for speed.
6. The user clicks "Add Customer" triggering `<CustomerModal />`. On submission, POSTs to the API and reloads the table.
7. Edit maps the row data gracefully back into `<CustomerModal />`.
8. Delete triggers the `<DeleteModal />` requiring confirmation. The backend enforces safety logic to prevent deletion if invoices exist.

## Architectural decisions
- **Service Layering**: Strictly enforced separation of concerns on the backend (Route -> Controller -> Service -> DB).
- **Client Search**: Opted for frontend filtering instead of backend querying because the dataset for an internal invoice suite typically fits easily in memory, ensuring lightning-fast search without network jitter.
- **Modal Modularity**: Consolidating create and edit into a single form logic prevents duplicated markup.
- **Foreign Key Resilience**: The backend delete controller checks for `ER_ROW_IS_REFERENCED_2` error codes and translates them cleanly so the user knows they cannot delete customers with tied invoices.

## Remaining work
- Module 05 requirements are completely fulfilled. The system is ready for the Invoice builder module.
