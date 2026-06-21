import { Plus, Trash2 } from 'lucide-react';
import { calculateItemAmount, formatCurrency } from '../../utils/calculations';

export default function InvoiceItemsTable({ items, onChange, errors, currency = 'CAD' }) {
  
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = calculateItemAmount(newItems[index].quantity, newItems[index].rate);
    }
    
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="border-b-2 border-border/80">
            <tr>
              <th className="px-2 py-3 text-xs font-semibold tracking-wider text-text-secondary uppercase w-[50%]">Description *</th>
              <th className="px-2 py-3 text-xs font-semibold tracking-wider text-text-secondary uppercase w-[15%] text-center">Quantity *</th>
              <th className="px-2 py-3 text-xs font-semibold tracking-wider text-text-secondary uppercase w-[15%] text-right">Rate *</th>
              <th className="px-2 py-3 text-xs font-semibold tracking-wider text-text-secondary uppercase w-[15%] text-right">Amount</th>
              <th className="px-2 py-3 w-[5%]"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-border/30 group hover:bg-secondary/20 transition-colors">
                <td className="p-1.5">
                  <input 
                    type="text" 
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className={`w-full bg-transparent border ${errors?.[`items.${index}.description`] ? 'border-danger' : 'border-transparent group-hover:border-border'} rounded px-3 py-2 text-sm text-white focus:border-primary focus:bg-secondary/50 outline-none transition-all`}
                    placeholder="Item description"
                  />
                </td>
                <td className="p-1.5">
                  <input 
                    type="number" 
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className={`w-full text-center bg-transparent border ${errors?.[`items.${index}.quantity`] ? 'border-danger' : 'border-transparent group-hover:border-border'} rounded px-3 py-2 text-sm text-white focus:border-primary focus:bg-secondary/50 outline-none transition-all`}
                  />
                </td>
                <td className="p-1.5">
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateItem(index, 'rate', e.target.value)}
                    className={`w-full text-right bg-transparent border ${errors?.[`items.${index}.rate`] ? 'border-danger' : 'border-transparent group-hover:border-border'} rounded px-3 py-2 text-sm text-white focus:border-primary focus:bg-secondary/50 outline-none transition-all`}
                  />
                </td>
                <td className="p-1.5 text-right text-sm text-white font-medium pr-4 whitespace-nowrap">
                  {formatCurrency(item.amount, currency)}
                </td>
                <td className="p-1.5 text-right">
                  <button 
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                    className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-3">
        <button 
          onClick={addItem}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
            <Plus size={14} />
          </div>
          Add Item
        </button>
      </div>
    </div>
  );
}
