import { formatCurrency } from '../../utils/calculations';

export default function InvoiceCalculations({ data, onChange }) {
  const updateField = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="w-full text-sm">
      <div className="space-y-1.5">
        <div className="flex justify-between items-center py-2">
          <span className="text-text-secondary font-medium tracking-wide">Subtotal</span>
          <span className="font-semibold text-white whitespace-nowrap">{formatCurrency(data.subtotal, data.currency)}</span>
        </div>
        
        <div className="flex justify-between items-center py-1.5 gap-4">
          <span className="text-text-secondary font-medium tracking-wide">Tax (%)</span>
          <input 
            type="number"
            min="0"
            max="100"
            value={data.tax}
            onChange={(e) => updateField('tax', e.target.value)}
            className="w-20 bg-secondary/50 border border-border rounded px-2 py-1 text-right text-white focus:border-primary outline-none transition-colors"
          />
        </div>
        
        <div className="flex justify-between items-center py-1.5 gap-4">
          <span className="text-text-secondary font-medium tracking-wide whitespace-nowrap">Discount</span>
          <input 
            type="number"
            min="0"
            value={data.discount}
            onChange={(e) => updateField('discount', e.target.value)}
            className="w-24 bg-secondary/50 border border-border rounded px-2 py-1 text-right text-white focus:border-primary outline-none transition-colors"
          />
        </div>
        
        <div className="flex justify-between items-center py-1.5 gap-4">
          <span className="text-text-secondary font-medium tracking-wide whitespace-nowrap">Shipping</span>
          <input 
            type="number"
            min="0"
            value={data.shipping}
            onChange={(e) => updateField('shipping', e.target.value)}
            className="w-24 bg-secondary/50 border border-border rounded px-2 py-1 text-right text-white focus:border-primary outline-none transition-colors"
          />
        </div>
        
        <div className="pt-4 mt-2 border-t-2 border-border/80 flex justify-between items-center">
          <span className="text-base font-bold text-white tracking-wide uppercase">Grand Total</span>
          <span className="text-xl font-bold text-primary whitespace-nowrap">{formatCurrency(data.total, data.currency)}</span>
        </div>
      </div>
    </div>
  );
}
