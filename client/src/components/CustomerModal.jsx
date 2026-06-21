import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';

export default function CustomerModal({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) {
  const defaultState = {
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    country: '',
    postal_code: '',
    notes: ''
  };

  const [formData, setFormData] = useState(defaultState);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({ ...defaultState, ...initialData });
      } else {
         
        setFormData(defaultState);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border w-full max-w-2xl rounded-[var(--radius-card)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {initialData ? 'Edit Customer' : 'Add Customer'}
          </h2>
          <button onClick={onClose} className="p-2 text-text-secondary hover:text-white rounded-full hover:bg-secondary transition-colors" disabled={isLoading}>
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form id="customer-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Company Name *" 
                name="company_name" 
                value={formData.company_name} 
                onChange={handleChange} 
                required 
                placeholder="Ocean Developers LTD"
              />
              <Input 
                label="Contact Person" 
                name="contact_person" 
                value={formData.contact_person} 
                onChange={handleChange} 
                placeholder="John Doe"
              />
              <Input 
                label="Email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="john@example.com"
              />
              <Input 
                label="Phone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="+1 234 567 8900"
              />
              <div className="md:col-span-2">
                <Input 
                  label="Address" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  placeholder="123 Ocean Drive"
                />
              </div>
              <Input 
                label="City" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                placeholder="Miami"
              />
              <Input 
                label="Province / State" 
                name="province" 
                value={formData.province} 
                onChange={handleChange} 
                placeholder="Florida"
              />
              <Input 
                label="Country" 
                name="country" 
                value={formData.country} 
                onChange={handleChange} 
                placeholder="USA"
              />
              <Input 
                label="Postal Code" 
                name="postal_code" 
                value={formData.postal_code} 
                onChange={handleChange} 
                placeholder="33101"
              />
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">Notes</label>
                <textarea 
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-secondary border border-border rounded-[var(--radius-input)] px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                  placeholder="Additional notes about this customer..."
                ></textarea>
              </div>
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-border flex justify-end gap-3 bg-secondary/30">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="customer-form" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Customer'}
          </Button>
        </div>
      </div>
    </div>
  );
}
