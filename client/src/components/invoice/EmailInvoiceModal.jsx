import { useState, useEffect } from 'react';
import { Mail, Send, X, AlertCircle } from 'lucide-react';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { api } from '../../services/api';

export default function EmailInvoiceModal({ isOpen, onClose, invoice, customer }) {
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && invoice) {
      setToEmail(customer?.email || '');
      setSubject(`Invoice ${invoice.invoice_number || ''}`);
      setMessage(`Dear ${customer?.company_name || 'Customer'},\n\nPlease find attached the invoice for your recent business with us.\n\nThank you,\nOcean Developers Ltd.`);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, invoice, customer]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!toEmail) {
      setError('Recipient email is required.');
      return;
    }

    try {
      setIsSending(true);
      setError(null);

      // Generate PDF as base64
      const { base64Pdf } = await generateInvoicePDF(invoice, 'pdf-invoice-container', { download: false });

      // Send to backend
      await api.post(`/invoices/${invoice.id}/email`, {
        toEmail,
        subject,
        message,
        base64Pdf
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to send email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-soft-purple overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-border bg-secondary/30">
          <h2 className="text-lg font-bold text-white flex items-center">
            <Mail size={18} className="mr-2 text-primary" />
            Email Invoice
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mb-4">
              <Send size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Email Sent Successfully!</h3>
            <p className="text-text-secondary">The invoice has been sent to {toEmail}</p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-4 space-y-4">
            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg flex items-start gap-3">
                <AlertCircle size={18} className="text-danger shrink-0 mt-0.5" />
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-text-secondary">To:</label>
              <input
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                placeholder="customer@example.com"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-text-secondary">Subject:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-text-secondary">Message:</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <div className="pt-4 border-t border-border flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-white transition-colors"
                disabled={isSending}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="flex items-center px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors shadow-soft-purple disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Send Invoice
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
