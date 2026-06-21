import Input from '../ui/Input';

export default function InvoiceSummaryCard({ data, onChange, errors }) {
  const handleChange = (e) => {
    onChange({ [e.target.name]: e.target.value });
  };

  const labelClass = "text-xs font-semibold tracking-wider uppercase text-text-secondary";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input 
        label="Invoice Number" 
        value={data.invoice_number || 'Auto-generated'} 
        disabled
        className="opacity-60 cursor-not-allowed"
        labelClassName={labelClass}
      />
      <div className="w-full flex flex-col gap-1.5">
        <label className={labelClass}>Currency</label>
        <select
          name="currency"
          value={data.currency || 'CAD'}
          onChange={handleChange}
          className="w-full bg-secondary border border-border rounded-[var(--radius-input)] px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        >
          <option value="CAD">CAD - Canadian Dollar</option>
          <option value="USD">USD - US Dollar</option>
          <option value="PKR">PKR - Pakistani Rupee</option>
          <option value="AED">AED - UAE Dirham</option>
          <option value="EUR">EUR - Euro</option>
          <option value="GBP">GBP - British Pound</option>
        </select>
      </div>
      <Input 
        label="Invoice Date *" 
        name="invoice_date"
        type="date"
        value={data.invoice_date || ''} 
        onChange={handleChange}
        error={errors?.invoice_date}
        labelClassName={labelClass}
      />
      <Input 
        label="Due Date *" 
        name="due_date"
        type="date"
        value={data.due_date || ''} 
        onChange={handleChange}
        error={errors?.due_date}
        labelClassName={labelClass}
      />
    </div>
  );
}
