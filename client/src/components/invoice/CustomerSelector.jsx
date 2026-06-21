import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export default function CustomerSelector({ customers, selectedCustomerId, onSelectCustomer, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const filteredCustomers = customers.filter(c => 
    c.company_name?.toLowerCase().includes(search.toLowerCase()) || 
    c.contact_person?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <label className="block text-xs font-semibold tracking-wider uppercase text-text-secondary mb-1.5">Bill To *</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-secondary border ${error ? 'border-danger' : 'border-border'} rounded-[var(--radius-input)] px-4 py-2.5 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors`}
      >
        <span className={selectedCustomer ? 'text-white' : 'text-text-secondary/50'}>
          {selectedCustomer ? selectedCustomer.company_name : 'Select a customer...'}
        </span>
        <ChevronDown size={18} className="text-text-secondary" />
      </div>
      
      {error && <span className="text-xs text-danger mt-1.5 block">{error}</span>}

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-border rounded-[var(--radius-card)] shadow-2xl overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border/50 flex items-center gap-2 bg-secondary/50">
            <Search size={16} className="text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-white w-full"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
            {filteredCustomers.length === 0 ? (
              <div className="p-4 text-center text-sm text-text-secondary">No customers found</div>
            ) : (
              filteredCustomers.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => { onSelectCustomer(c.id); setIsOpen(false); setSearch(''); }}
                  className="px-3 py-2.5 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
                >
                  <div className="text-sm font-medium text-white">{c.company_name}</div>
                  {c.contact_person && <div className="text-xs text-text-secondary mt-0.5">{c.contact_person}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}
    </div>
  );
}
