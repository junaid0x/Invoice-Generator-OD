# Module 10: Business Settings

## Overview
Built a centralized Business Settings module to manage company information, branding, invoice defaults, and email configuration. This module successfully removes hardcoded values from the codebase, making the application fully dynamic and customizable for a single company.

## Files Created
- `server/alterSettings.js`: Migration script to add new configuration columns to the `settings` database table.
- `server/services/settingsService.js`: Encapsulates logic for retrieving and updating the single settings record (`id = 1`).
- `server/controllers/settingsController.js`: Express controller handling `/api/settings` and `/api/settings/upload-logo`.
- `server/routes/settingsRoutes.js`: Defines routes and integrates `multer` for logo file uploads.
- `project-management/modules/Module10.md`: This documentation file.

## Files Modified
- `server/server.js`: Mounted `settingsRoutes` and configured Express to serve static files from the `uploads/` directory.
- `client/src/pages/Settings.jsx`: Redesigned the component to fetch, display, and update all settings sections (Company Info, Branding, Defaults, Numbering, Email) with dynamic state tracking and an "Unsaved Changes" indicator.
- `server/services/invoiceService.js`: Replaced hardcoded `OD-` prefix and starting number `0001` with `invoice_prefix` and `starting_number` fetched from the settings table for invoice number generation. Replaced hardcoded 'CAD' currency with the default currency.
- `client/src/pages/InvoiceBuilder.jsx`: Added settings fetching. Pre-filled invoice currency, notes, terms, and tax dynamically from settings instead of hardcoded strings. Replaced hardcoded logo with `settings.logo_url`.
- `client/src/components/invoice/InvoicePreviewDocument.jsx` & `InvoiceDocument.jsx`: Updated to use `settings.company_name`, `logo_url`, address, phone, and website instead of hardcoded Ocean Developers branding.
- `client/src/pages/Dashboard.jsx`: Updated to format total revenue and invoice amounts using the dynamic currency from the dashboard's `topStats` (which fetches it from the settings table).

## Business Logic
- **Single Source of Truth**: The `settings` table is exclusively used with `id = 1`. The `updateSettings` logic uses an upsert approach: it inserts the record if missing, otherwise it updates the existing fields.
- **Logo Upload**: Integrated `multer` for local file uploads. Logos are saved to `server/uploads/` and served statically.
- **Dynamic Formatting**: Replaced all frontend occurrences of hardcoded 'CAD' currency passing with the dynamic currency retrieved from settings.

## Architectural Decisions
- Used an inline accordion to collapse the Email Configuration section since it's inactive, ensuring it doesn't clutter the UI while still being available for future implementation.
- Handled settings fetching at the highest necessary component level (`InvoiceBuilder.jsx` and `Dashboard.jsx`) and passed them down to pure UI components like `InvoicePreviewDocument` to minimize redundant API calls.

## Remaining Work
- Module 10 is complete. Stop execution.
