# Patch 08A: Architecture Repair

## Architecture Repairs
1. **Responsibility Separation**: `InvoiceBuilder.jsx` now strictly focuses on workspace management (toggling modes, validating data, saving). All PDF orchestration, state, and UI are handled inside the dedicated `PdfActions` component.
2. **True Single Source of Truth**: Removed the hidden off-screen `createRoot` rendering inside `pdfGenerator`. The engine now directly takes a high-resolution snapshot of the already-visible `InvoicePreviewDocument` from the DOM, guaranteeing absolutely zero duplicate invoices.
3. **UI Spacing Restored**: Removed the misplaced PDF controls from the editor workspace interface. The editor returns to its untouched, approved Module 07 layout. The PDF button now correctly appears *only* when the user toggles into Preview Mode.

## Components Created/Moved
- **`client/src/components/invoice/PdfActions.jsx`**: Created a dedicated component to house the "Download PDF" button, manage loading states, handle error catching, and invoke the engine.
- **`client/src/utils/pdfGenerator.js`**: Reverted back to a pure Vanilla `.js` file since it no longer requires JSX or React hooks. Stripped out `react-dom/client` usage and simplified it to target the active DOM ID.

## Files Modified
- **`client/src/pages/InvoiceBuilder.jsx`**: 
  - Purged all PDF generation imports, states, and functions.
  - Reverted header UI and mobile save buttons.
  - Injected `<PdfActions />` exclusively inside the `viewMode === 'preview'` rendering block.
