import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionApi';

export default function AddEditSubscriptionModal({ subscription, customers, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    customer_id: '',
    service_type: 'Hosting',
    service_name: '',
    service_identifier: '',
    provider: '',
    price: 0,
    purchase_date: new Date().toISOString().split('T')[0],
    renewal_date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (subscription) {
      setFormData({
        customer_id: subscription.customer_id || '',
        service_type: subscription.service_type || 'Hosting',
        service_name: subscription.service_name || '',
        service_identifier: subscription.service_identifier || '',
        provider: subscription.provider || '',
        price: subscription.price || 0,
        purchase_date: subscription.purchase_date ? subscription.purchase_date.split('T')[0] : '',
        renewal_date: subscription.renewal_date ? subscription.renewal_date.split('T')[0] : '',
        notes: subscription.notes || ''
      });
    }
  }, [subscription]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (subscription) {
        await subscriptionService.update(subscription.id, formData);
      } else {
        await subscriptionService.create(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save subscription');
      setLoading(false);
    }
  };

  const isWebsiteMaintenance = formData.service_type === 'Website Maintenance';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-white">
            {subscription ? 'Edit Subscription' : 'Add Subscription'}
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
              {error}
            </div>
          )}

          <form id="subscription-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Client *</label>
                <div className="relative">
                  <select 
                    name="customer_id" 
                    value={formData.customer_id}
                    onChange={handleChange}
                    required
                    className="appearance-none cursor-pointer w-full bg-secondary/80 border border-border/60 hover:border-border rounded-xl pl-4 pr-10 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                  >
                    <option value="" disabled className="bg-background text-text-secondary">Select a client...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id} className="bg-background text-white">{c.company_name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Service Type *</label>
                <div className="relative">
                  <select 
                    name="service_type" 
                    value={formData.service_type}
                    onChange={handleChange}
                    required
                    className="appearance-none cursor-pointer w-full bg-secondary/80 border border-border/60 hover:border-border rounded-xl pl-4 pr-10 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                  >
                    <option value="Hosting" className="bg-background text-white">Hosting</option>
                    <option value="Business Email" className="bg-background text-white">Business Email</option>
                    <option value="Website Maintenance" className="bg-background text-white">Website Maintenance</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Service Name *</label>
                <input 
                  type="text" 
                  name="service_name" 
                  value={formData.service_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Shared Hosting"
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Service Identifier</label>
                <input 
                  type="text" 
                  name="service_identifier" 
                  value={formData.service_identifier}
                  onChange={handleChange}
                  placeholder="e.g. example.com"
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>



              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Price</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  name="price" 
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Purchase Date *</label>
                <input 
                  type="date" 
                  name="purchase_date" 
                  value={formData.purchase_date}
                  onChange={handleChange}
                  required
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              {!isWebsiteMaintenance && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Renewal Date *</label>
                  <input 
                    type="date" 
                    name="renewal_date" 
                    value={formData.renewal_date}
                    onChange={handleChange}
                    required
                    className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Notes</label>
              <textarea 
                name="notes" 
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-border flex justify-end gap-3 bg-secondary/20">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-white font-medium hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="subscription-form"
            disabled={loading}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-soft-purple disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Subscription'}
          </button>
        </div>
      </div>
    </div>
  );
}
