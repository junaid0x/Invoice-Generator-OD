// React auto-imported
import { formatCurrency } from '../../utils/calculations';
import { getAssetUrl } from '../../services/api';

export default function InvoicePreviewDocument({ invoice, customer, settings }) {
  return (
    <div className="bg-white p-14 pb-12 max-w-[1000px] mx-auto shadow-[0_0_40px_rgba(0,0,0,0.05)] rounded-lg border border-slate-100 relative" style={{ fontFamily: "'Inter', Arial, sans-serif" }}>
      <div className="flex justify-between items-start mb-8">
        <div>
          {settings?.logo_url ? (
            <img src={getAssetUrl(settings.logo_url)} alt={settings?.company_name || 'Company Logo'} className="h-24 object-contain mb-8" style={{ imageRendering: 'high-quality' }} />
          ) : (
            <h2 className="text-2xl font-bold text-[#111827] mb-8">{settings?.company_name || 'Company Name'}</h2>
          )}
          <div className="text-[15px] text-[#374151] space-y-2 font-medium leading-[1.6]">
            {settings?.company_address && <p>{settings.company_address}</p>}
            {settings?.company_phone && <p>{settings.company_phone}</p>}
            {settings?.company_email && <p>{settings.company_email}</p>}
            {settings?.company_website && <p>{settings.company_website}</p>}
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-5xl font-light tracking-[0.3em] text-[#111827] mb-2">INVOICE</h1>
          <p className="font-medium text-[#374151] text-base tracking-widest">{invoice.invoice_number || 'DRAFT'}</p>
        </div>
      </div>

      {/* Thin purple accent line */}
      <div className="w-full border-b border-[#8B3DFF] opacity-30 mb-12"></div>

      <div className="flex justify-between items-end mb-16">
        <div className="max-w-[50%]">
          <h2 className="text-[#4B5563] font-semibold mb-3 uppercase text-[10px] tracking-[0.2em]">Bill To</h2>
          <h3 className="text-2xl font-bold text-[#111827] mb-2">{customer?.company_name || 'Customer Name'}</h3>
          {customer?.phone && <p className="text-[15px] text-[#374151] font-medium leading-[1.6] mb-1">{customer.phone}</p>}
          {customer?.email && <p className="text-[15px] text-[#374151] font-medium leading-[1.6]">{customer.email}</p>}
        </div>
        <div className="text-right w-[40%]">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <span className="text-[#4B5563] font-semibold text-right uppercase text-[10px] tracking-[0.1em] self-center">Date</span>
            <span className="text-[#111827] font-medium">{invoice.invoice_date || '-'}</span>
            
            <span className="text-[#4B5563] font-semibold text-right uppercase text-[10px] tracking-[0.1em] self-center">Due Date</span>
            <span className="text-[#111827] font-medium">{invoice.due_date || '-'}</span>
            
            <span className="text-[#4B5563] font-semibold text-right uppercase text-[10px] tracking-[0.1em] pt-4 mt-2 border-t border-slate-100 self-center">Balance Due</span>
            <span className="text-[#111827] font-extrabold text-lg pt-4 mt-2 border-t border-slate-100">{formatCurrency(invoice.total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-[#111827] text-[10px] tracking-[0.2em] uppercase text-[#4B5563]">
              <th className="pb-4 font-semibold w-1/2">Description</th>
              <th className="pb-4 font-semibold w-1/6 text-right">Quantity</th>
              <th className="pb-4 font-semibold w-1/6 text-right">Rate</th>
              <th className="pb-4 font-semibold w-1/6 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).map((item, index) => (
              <tr key={index} className="border-b border-slate-100 text-sm font-medium">
                <td className="py-6 text-[#111827] pr-4 leading-[1.6] text-[15px]">{item.description}</td>
                <td className="py-6 text-right text-[#374151]">{item.quantity}</td>
                <td className="py-6 text-right text-[#374151]">{formatCurrency(item.rate, invoice.currency)}</td>
                <td className="py-6 text-right text-[#111827]">{formatCurrency(item.amount, invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-16 text-sm pt-4">
        <div className="flex flex-col gap-10">
          {invoice.notes && (
            <div>
              <h4 className="text-[#4B5563] font-semibold mb-3 uppercase tracking-[0.2em] text-[10px]">Notes</h4>
              <p className="text-[#374151] whitespace-pre-wrap font-medium leading-[1.6] text-sm">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <h4 className="text-[#4B5563] font-semibold mb-3 uppercase tracking-[0.2em] text-[10px]">Terms</h4>
              <p className="text-[#374151] whitespace-pre-wrap font-medium leading-[1.6] text-sm">{invoice.terms}</p>
            </div>
          )}
        </div>
        
        <div className="pl-8">
          <div className="w-full">
            <div className="flex justify-between items-center py-3 text-sm font-medium text-[#374151]">
              <span>Subtotal</span>
              <span className="text-[#111827]">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            <div className="flex justify-between items-center py-3 text-sm font-medium text-[#374151]">
              <span>Tax ({invoice.tax || 0}%)</span>
              <span className="text-[#111827]">{formatCurrency((invoice.subtotal || 0) * ((invoice.tax || 0) / 100), invoice.currency)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between items-center py-3 text-sm font-medium text-[#374151]">
                <span>Discount</span>
                <span className="text-[#111827]">-{formatCurrency(invoice.discount, invoice.currency)}</span>
              </div>
            )}
            {invoice.shipping > 0 && (
              <div className="flex justify-between items-center py-3 text-sm font-medium text-[#374151]">
                <span>Shipping</span>
                <span className="text-[#111827]">{formatCurrency(invoice.shipping, invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-6 mt-4 border-t-2 border-[#8B3DFF]">
              <span className="text-[#111827] font-extrabold text-sm uppercase tracking-wider">Total</span>
              <span className="text-3xl font-extrabold text-[#111827] tracking-tight">{formatCurrency(invoice.total, invoice.currency)}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
