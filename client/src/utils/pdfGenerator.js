import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const generateInvoicePDF = async (invoice, elementId = 'pdf-invoice-container', options = { download: true }) => {
  return new Promise((resolve, reject) => {
    // Small timeout to allow any pending renders or images to settle
    setTimeout(async () => {
      try {
        const element = document.getElementById(elementId);
        if (!element) {
          throw new Error("Could not find invoice container on screen");
        }

        // Apply PDF-specific typography class
        element.classList.add('pdf-export');

        // Capture the DOM with high scaling for crisp text/logo
        const canvas = await html2canvas(element, {
          scale: 4, 
          useCORS: true,
          backgroundColor: '#ffffff',
          allowTaint: false,
          logging: false,
          imageTimeout: 0
        });

        // Remove PDF-specific typography class immediately after capture
        element.classList.remove('pdf-export');

        // A4 dimensions in mm: 210 x 297
        const pdfWidth = 210;
        const pdfHeight = 297;
        
        // Calculate proportional height
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Initialize jsPDF in portrait mode with A4 paper with compression disabled
        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: 'a4',
          compress: false
        });
        
        let heightLeft = imgHeight;
        let position = 0;

        // Add the first page
        pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;

        // Handle multi-page generation if the invoice is very long
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
          heightLeft -= pdfHeight;
        }

        // Generate dynamic filename
        const year = new Date().getFullYear();
        const number = invoice.invoice_number || 'DRAFT';
        const filename = `invoice-OD-${year}-${number}.pdf`;

        if (options.download) {
          // Trigger download
          pdf.save(filename);
          resolve();
        } else {
          // Return base64
          const base64Pdf = pdf.output('datauristring');
          resolve({ filename, base64Pdf });
        }
      } catch (err) {
        const el = document.getElementById(elementId);
        if (el) el.classList.remove('pdf-export');
        reject(err);
      }
    }, 100);
  });
};
