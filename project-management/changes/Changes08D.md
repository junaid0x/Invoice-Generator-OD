# Patch 08D: Final PDF Typography & Action Simplification

## Files Modified
- `client/src/utils/pdfGenerator.js`
- `client/src/index.css`
- `client/src/pages/InvoiceBuilder.jsx`

## Typography Improvements
- **PDF-Specific Styles**: Introduced a dedicated `.pdf-export` CSS class specifically designed to only activate during `html2canvas` PDF rendering.
- **Contrast Enhancements**: Mapped extremely dark grays and near-blacks to the default Tailwind `slate` CSS variables exclusively for PDF export:
  - Main headings (`slate-800`, `slate-900`): `#111827`
  - Body text (`slate-600`, `slate-700`): `#1F2937`
  - Labels (`slate-400`, `slate-500`): `#4B5563`
- **Scale Optimization**: Increased critical font sizes by 1-2px using the export modifier:
  - `.text-sm` (Address, Phone, Notes, Terms, Body Text): Increased to `15px` with a `1.6` line-height and `500` font-weight.
  - `.text-[10px]` (Labels): Increased to `12px` and `600` font-weight.
- **Font Weight Adjustments**:
  - Customer name: `700`
  - Invoice title: `300`
  - Invoice number: `500`
  - Labels: `600`
  - Body text: `500`
- **Render Quality**: Kept `scale: 4`, `useCORS: true`, and `backgroundColor: '#ffffff'` inside `pdfGenerator.js`. Did not downscale images prior to jsPDF placement.

## Action Simplification
- **Button Standardization**: Removed the confusing "Save & Issue" behavior entirely from the `InvoiceBuilder.jsx` UI.
- **Workflow Restructured**: Replaced the primary action with **"Save Invoice"**, which saves the invoice state to `Pending` under the hood. "Save Draft" correctly continues to save to `Draft`.
- **Global Cleansing**: Removed all textual references to "Issue", "Issued", and "Save & Issue" across the invoice interface to ensure consistent terminology moving forward.

## Architectural Decisions
- To maintain a perfect, unaltered web preview mode, PDF styling was strictly decoupled. `pdfGenerator.js` cleanly injects the `.pdf-export` class onto the root invoice element right before canvas capturing and immediately tears it down in the cleanup phase (including fallback error states).
- Future compatibility constraint met: No email functionality was implemented, retaining a clean path for the future "Email Invoice" feature.
- No layouts, core components, algorithms, or API endpoints were modified. The frontend invoice experience remains highly performant and stable.
