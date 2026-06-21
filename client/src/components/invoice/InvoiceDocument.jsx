// React auto-imported
import { formatCurrency } from '../../utils/calculations';

export default function InvoiceDocument({ invoice, customer, settings }) {
  return (
    <div className="bg-white text-black p-12 font-sans max-w-[850px] mx-auto shadow-2xl rounded-sm">
      <div className="flex justify-between items-start mb-16">
        <div>
          {settings?.logo_url ? (
            <img src={settings.logo_url.startsWith('http') || settings.logo_url.startsWith('/') ? settings.logo_url : `http://localhost:5000${settings.logo_url}`} alt={settings?.company_name || 'Company Logo'} className="h-16 object-contain mb-6" />
          ) : (
            <h2 className="text-xl font-bold text-gray-800 mb-6">{settings?.company_name || 'Company Name'}</h2>
          )}
          <div className="text-sm text-gray-600 space-y-1">
            {settings?.company_address && <p>{settings.company_address}</p>}
            {settings?.company_phone && <p>{settings.company_phone}</p>}
            {settings?.company_email && <p>{settings.company_email}</p>}
            {settings?.company_website && <p>{settings.company_website}</p>}
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-light tracking-widest text-gray-800 mb-3">INVOICE</h1>
          <p className="font-semibold text-gray-600 text-lg">{invoice.invoice_number || 'DRAFT'}</p>
        </div>
      </div>

      <div className="flex justify-between items-start mb-16">
        <div className="max-w-[50%]">
          <h2 className="text-gray-500 font-semibold mb-3 uppercase text-xs tracking-widest">Bill To</h2>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{customer?.company_name || 'Customer Name'}</h3>
          {customer?.phone && <p className="text-sm text-gray-600 mb-1">{customer.phone}</p>}
          {customer?.email && <p className="text-sm text-gray-600">{customer.email}</p>}
        </div>
        <div className="text-right w-[40%]">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <span className="text-gray-500 font-medium text-right">Date:</span>
            <span className="text-gray-800 font-semibold">{invoice.invoice_date || '-'}</span>
            
            <span className="text-gray-500 font-medium text-right">Due Date:</span>
            <span className="text-gray-800 font-semibold">{invoice.due_date || '-'}</span>
            
            <span className="text-gray-500 font-medium text-right pt-3 mt-1 border-t border-gray-200">Balance Due:</span>
            <span className="text-gray-800 font-bold text-base pt-3 mt-1 border-t border-gray-200">{formatCurrency(invoice.total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      <div className="mb-10 min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-800 text-xs tracking-widest uppercase text-gray-500">
              <th className="py-4 font-semibold w-1/2">Description</th>
              <th className="py-4 font-semibold w-1/6 text-center">Quantity</th>
              <th className="py-4 font-semibold w-1/6 text-right">Rate</th>
              <th className="py-4 font-semibold w-1/6 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).map((item, index) => (
              <tr key={index} className="border-b border-gray-200 text-sm">
                <td className="py-5 text-gray-800 pr-4">{item.description}</td>
                <td className="py-5 text-center text-gray-600">{item.quantity}</td>
                <td className="py-5 text-right text-gray-600">{formatCurrency(item.rate, invoice.currency)}</td>
                <td className="py-5 text-right font-medium text-gray-800">{formatCurrency(item.amount, invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-16">
        <div className="w-1/2 max-w-[320px]">
          <div className="flex justify-between items-center py-2.5 text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
          </div>
          <div className="flex justify-between items-center py-2.5 text-sm text-gray-600">
            <span>Tax ({invoice.tax || 0}%)</span>
            <span>{formatCurrency((invoice.subtotal || 0) * ((invoice.tax || 0) / 100), invoice.currency)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between items-center py-2.5 text-sm text-gray-600">
              <span>Discount</span>
              <span>-{formatCurrency(invoice.discount, invoice.currency)}</span>
            </div>
          )}
          {invoice.shipping > 0 && (
            <div className="flex justify-between items-center py-2.5 text-sm text-gray-600">
              <span>Shipping</span>
              <span>{formatCurrency(invoice.shipping, invoice.currency)}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-4 border-t-2 border-gray-800 mt-2 text-xl font-bold text-gray-800">
            <span>Total</span>
            <span>{formatCurrency(invoice.total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 text-sm mt-auto pt-10 border-t border-gray-100">
        <div>
          <h4 className="text-gray-400 font-semibold mb-3 uppercase tracking-widest text-xs">Notes</h4>
          <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
        </div>
        <div>
          <h4 className="text-gray-400 font-semibold mb-3 uppercase tracking-widest text-xs">Terms</h4>
          <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{invoice.terms}</p>
        </div>
      </div>
    </div>
  );
}
