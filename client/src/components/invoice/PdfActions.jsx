import { useState } from 'react';
import { Download, Mail } from 'lucide-react';
import Button from '../ui/Button';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import EmailInvoiceModal from './EmailInvoiceModal';

export default function PdfActions({ invoice, customer, containerId = 'pdf-invoice-container' }) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generateInvoicePDF(invoice, containerId);
    } catch (err) {
      alert('Failed to generate PDF: ' + err.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <Button 
        variant="secondary" 
        onClick={handleDownloadPdf}
        disabled={isGeneratingPdf}
      >
        {isGeneratingPdf ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white border-t-transparent mr-2"></div>
            Generating PDF...
          </>
        ) : (
          <>
            <Download size={16} className="mr-2" />
            Download PDF
          </>
        )}
      </Button>

      <Button
        variant="primary"
        className="shadow-soft-purple"
        onClick={() => setIsEmailModalOpen(true)}
      >
        <Mail size={16} className="mr-2" />
        Email Invoice
      </Button>

      <EmailInvoiceModal 
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        invoice={invoice}
        customer={customer}
      />
    </div>
  );
}
