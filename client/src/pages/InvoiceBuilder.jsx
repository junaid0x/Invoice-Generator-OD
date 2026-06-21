import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Edit, Eye } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import CustomerSelector from '../components/invoice/CustomerSelector';
import CustomerInfoCard from '../components/invoice/CustomerInfoCard';
import InvoiceSummaryCard from '../components/invoice/InvoiceSummaryCard';
import InvoiceItemsTable from '../components/invoice/InvoiceItemsTable';
import InvoiceCalculations from '../components/invoice/InvoiceCalculations';
import InvoiceNotes from '../components/invoice/InvoiceNotes';
import InvoiceTerms from '../components/invoice/InvoiceTerms';
import InvoicePreviewDocument from '../components/invoice/InvoicePreviewDocument';
import InvoiceDocumentLayout from '../components/invoice/InvoiceDocumentLayout';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

import { customerService } from '../services/customerService';
import { invoiceService } from '../services/invoiceService';
import { calculateSubtotal, calculateGrandTotal } from '../utils/calculations';
import PdfActions from '../components/invoice/PdfActions';

export default function InvoiceBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState('edit');
  
  const [customers, setCustomers] = useState([]);
  const [errors, setErrors] = useState({});

  const [invoice, setInvoice] = useState({
    customer_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    currency: 'CAD',
    notes: '',
    terms: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    subtotal: 0,
    tax: 0,
    discount: 0,
    shipping: 0,
    total: 0
  });

  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const custRes = await customerService.getAll();
        setCustomers(custRes.data);

        const token = localStorage.getItem('token');
        const settingsRes = await fetch('http://localhost:5000/api/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const settingsData = await settingsRes.json();
        setSettings(settingsData);

        if (id) {
          const invRes = await invoiceService.getById(id);
          const data = invRes.data;
          
          if (data.invoice_date) data.invoice_date = data.invoice_date.split('T')[0];
          if (data.due_date) data.due_date = data.due_date.split('T')[0];
          
          if (!data.items || data.items.length === 0) {
            data.items = [{ description: '', quantity: 1, rate: 0, amount: 0 }];
          }
          
          setInvoice(data);
        } else {
          setInvoice(prev => ({
            ...prev,
            currency: settingsData.currency || 'CAD',
            notes: settingsData.default_notes || '',
            terms: settingsData.default_payment_terms || '',
            tax: parseFloat(settingsData.default_tax) || 0
          }));
        }
      } catch {
        alert('Failed to initialize workspace');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [id]);

  useEffect(() => {
    const subtotal = calculateSubtotal(invoice.items);
    const total = calculateGrandTotal(subtotal, invoice.tax, invoice.discount, invoice.shipping);
    
    if (subtotal !== invoice.subtotal || total !== invoice.total) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInvoice(prev => ({ ...prev, subtotal, total }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice.items, invoice.tax, invoice.discount, invoice.shipping]);

  const validate = () => {
    const newErrors = {};
    if (!invoice.customer_id) newErrors.customer_id = 'Customer is required';
    if (!invoice.invoice_date) newErrors.invoice_date = 'Invoice date is required';
    if (!invoice.due_date) newErrors.due_date = 'Due date is required';
    
    invoice.items.forEach((item, idx) => {
      if (!item.description) newErrors[`items.${idx}.description`] = 'Required';
      if (item.quantity <= 0) newErrors[`items.${idx}.quantity`] = 'Must be > 0';
      if (item.rate < 0) newErrors[`items.${idx}.rate`] = 'Cannot be negative';
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (status) => {
    if (!validate()) {
      setViewMode('edit');
      alert('Please fix validation errors before saving.');
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = { ...invoice, status };
      if (id) {
        await invoiceService.update(id, payload);
      } else {
        await invoiceService.create(payload);
      }
      navigate('/invoices');
    } catch (err) {
      alert(err.message || 'Failed to save invoice');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Invoice Workspace" />
        <LoadingSkeleton rows={10} columns={4} />
      </div>
    );
  }

  const selectedCustomer = customers.find(c => c.id === invoice.customer_id);

  return (
    <div className="space-y-6 pb-20 w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/invoices')}
            className="p-2 bg-secondary text-text-secondary hover:text-white rounded-lg transition-colors"
            title="Back to Invoices"
          >
            <ArrowLeft size={20} />
          </button>
          <PageHeader 
            title={id ? `Edit Invoice ${invoice.invoice_number}` : 'Create Invoice'} 
            subtitle="Professional invoice workspace."
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-secondary/80 rounded-lg p-1 border border-border">
            <button 
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'edit' ? 'bg-primary text-white shadow-soft-purple' : 'text-text-secondary hover:text-white'}`}
            >
              <Edit size={14} />
              Editor
            </button>
            <button 
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'preview' ? 'bg-primary text-white shadow-soft-purple' : 'text-text-secondary hover:text-white'}`}
            >
              <Eye size={14} />
              Preview
            </button>
          </div>
          
          <div className="h-8 w-px bg-border hidden sm:block"></div>
          
          <div className="hidden sm:flex items-center gap-2">
            <Button 
              variant="secondary" 
              onClick={() => handleSave('draft')}
              disabled={isSaving}
            >
              <Save size={16} className="mr-2" />
              Save Draft
            </Button>
            <Button 
              variant="primary" 
              onClick={() => handleSave('pending')}
              disabled={isSaving}
              className="shadow-soft-purple"
            >
              <Save size={16} className="mr-2" />
              Save Invoice
            </Button>
          </div>
        </div>
      </div>
      
      {viewMode === 'edit' ? (
        <InvoiceDocumentLayout 
          headerLeft={
            settings?.logo_url ? (
              <img src={settings.logo_url.startsWith('http') || settings.logo_url.startsWith('/') ? settings.logo_url : `http://localhost:5000${settings.logo_url}`} alt={settings?.company_name || 'Company Logo'} className="h-12 object-contain" />
            ) : (
              <h2 className="text-xl font-bold text-white">{settings?.company_name || 'Company Name'}</h2>
            )
          }
          headerRight={
            <div className="text-left sm:text-right">
              <h1 className="text-3xl font-light tracking-widest text-white mb-1">INVOICE</h1>
              <p className="text-sm font-medium text-text-secondary tracking-widest">{invoice.invoice_number || 'DRAFT'}</p>
            </div>
          }
          customerSection={
            <div className="space-y-3">
              <CustomerSelector 
                customers={customers} 
                selectedCustomerId={invoice.customer_id} 
                onSelectCustomer={(id) => setInvoice(prev => ({ ...prev, customer_id: id }))}
                error={errors.customer_id}
              />
              <CustomerInfoCard customer={selectedCustomer} />
            </div>
          }
          infoSection={
            <div className="space-y-3">
              <label className="block text-xs font-semibold tracking-wider uppercase text-text-secondary mb-1.5 hidden md:block opacity-0">Spacer</label>
              <InvoiceSummaryCard 
                data={invoice} 
                onChange={(data) => setInvoice(prev => ({ ...prev, ...data }))}
                errors={errors}
              />
            </div>
          }
          tableSection={
            <InvoiceItemsTable 
              items={invoice.items} 
              onChange={(items) => setInvoice(prev => ({ ...prev, items }))}
              errors={errors}
              currency={invoice.currency}
            />
          }
          notesSection={
            <InvoiceNotes 
              notes={invoice.notes} 
              onChange={(notes) => setInvoice(prev => ({ ...prev, notes }))} 
            />
          }
          termsSection={
            <InvoiceTerms 
              terms={invoice.terms} 
              onChange={(terms) => setInvoice(prev => ({ ...prev, terms }))} 
            />
          }
          calculationsSection={
            <InvoiceCalculations 
              data={invoice} 
              onChange={(data) => setInvoice(prev => ({ ...prev, ...data }))}
            />
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <PdfActions invoice={invoice} customer={selectedCustomer} containerId="pdf-invoice-container" />
          </div>
          <div className="bg-black/20 p-8 rounded-[var(--radius-card)] border border-border overflow-auto flex justify-center">
            <div id="pdf-invoice-container">
              <InvoicePreviewDocument invoice={invoice} customer={selectedCustomer} settings={settings} />
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Save Buttons */}
      <div className="flex sm:hidden flex-col gap-3 mt-6">
        <Button 
          variant="primary" 
          className="w-full justify-center py-3 shadow-soft-purple"
          onClick={() => handleSave('pending')}
          disabled={isSaving}
        >
          <Save size={16} className="mr-2" />
          Save Invoice
        </Button>
        <Button 
          variant="secondary" 
          className="w-full justify-center py-3"
          onClick={() => handleSave('draft')}
          disabled={isSaving}
        >
          <Save size={16} className="mr-2" />
          Save Draft
        </Button>
      </div>
    </div>
  );
}
