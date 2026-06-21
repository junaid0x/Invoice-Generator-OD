# Patch 07B Report

## Objective
Refine the Invoice Workspace layout and thoroughly prepare the user interface layer for the eventual Module 08 PDF Engine. This patch focused on visual polishing, injecting defaults, and introducing a preview rendering component exactly matching the expected physical document design.

## Files modified
- `client/src/pages/InvoiceBuilder.jsx`

## Files created
- `client/src/components/invoice/InvoiceDocument.jsx`

## Fields removed
- Confirmed that **PO Number** and **Payment Terms** inputs remain strictly eliminated from all forms and payloads.

## Fields added
- Introduced a **View Mode Toggle** inside `InvoiceBuilder` allowing users to switch between the "Editor" layout and the new printable "Preview" layout.

## Defaults added
- **Notes Default**: `"This is the electronically generated invoice so no signature is required"`
- **Terms Default**: `"For E-Transfer use\nfinance@oceandevelopersltd.com\npassword: Calgary"`
These automatically pre-fill when initiating a new workspace. Users can still safely overwrite them via the editor.

## Logo integration
- Copied `OD-Logo.png` from the `references` directory into `client/public/`.
- Embedded the logo elegantly at the top-left of the `InvoiceBuilder` workspace header.
- Scaled and nested the logo directly into the upper-left of the physical invoice preview.

## Architectural decisions
- **Visual Separation**: Instead of forcing the interactive forms (which must feel like a dashboard) to look like a physical piece of paper, I decoupled them. I created `InvoiceDocument.jsx` which completely disregards dark mode and dashboard themes, opting exclusively for black text on a white background with heavy whitespace, adhering strictly to PDF rendering standards (`docs/07-invoice-document-design.md`). 
- **Preview Toggle**: Implemented a state-based tab layout allowing administrators to "Preview" this `InvoiceDocument` component directly within the browser without having to wait for the backend PDF generation logic to be fully built in Module 08. This allows perfect visual QA before emitting real documents.
