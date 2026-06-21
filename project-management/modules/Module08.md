# Module 08: PDF Export

## Objective
Implement a robust, client-side PDF export system for invoices using the approved preview design as the single source of truth.

## Dependencies Installed
- **`html2canvas`**: Used to render the highly stylized React DOM nodes into a canvas. This ensures our custom typography, layouts, and spacing are captured perfectly.
- **`jspdf`**: Used to compile the captured canvas into a multi-page, high-quality, downloadable PDF document.
- *Reasoning*: These libraries run entirely on the client, avoiding the need for heavy server-side dependencies (like Puppeteer), ensuring strict shared hosting compatibility.

## Files Created
- **`client/src/utils/pdfGenerator.js`**: Core utility that handles off-screen rendering of the `InvoicePreviewDocument`, captures the canvas, calculates pagination, and generates the downloadable file.

## Files Modified
- **`client/src/pages/InvoiceBuilder.jsx`**: 
  - Added "Download PDF" button to desktop and mobile views.
  - Implemented `isGeneratingPdf` loading state with a spinner UI.
  - Added error boundary logic (`handleDownloadPdf`) to surface alerts if PDF generation fails.

## PDF Generation Flow
1. User clicks "Download PDF". Button disables and shows a spinner.
2. The `pdfGenerator.js` creates a visually hidden `div` appended to the body.
3. `react-dom/client` renders the `InvoicePreviewDocument` with the current invoice and customer data into this hidden div.
4. After a slight delay to ensure fonts and images (like the logo) are loaded, `html2canvas` captures the div with a scale of `2` for high resolution.
5. The canvas is passed to `jsPDF`, which breaks the image vertically into multiple A4 pages if the invoice is long.
6. The PDF is saved using a dynamic name format (`invoice-OD-{year}-{number}.pdf`).
7. The hidden div is cleanly unmounted and removed from the DOM.

## Architectural Decisions
- **Off-screen Rendering**: By rendering the `InvoicePreviewDocument` off-screen, we guarantee that the PDF output is perfectly identical to the visual preview, satisfying the single source of truth rule.
- **Client-Side Processing**: Bypassed Node.js PDF generation tools to reduce hosting costs and server footprint.
- **Reusable Utility Structure**: The PDF logic is isolated in a utility function (`pdfGenerator.js`), making it effortless to re-use in future modules (e.g., Module 12: Emailing).

## Remaining Work
- Module 08 is fully complete. The generator is built to easily hook into email functionality when it is implemented in the future.
