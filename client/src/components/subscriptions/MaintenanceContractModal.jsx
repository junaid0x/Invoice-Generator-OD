import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionApi';

export default function MaintenanceContractModal({ subscription, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    contract_start: new Date().toISOString().split('T')[0],
    contract_end: '',
    price: 0,
    notes: 'Maintenance Contract Activated'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await subscriptionService.activateMaintenance(subscription.id, formData);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to activate contract');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle size={20} className="text-primary" />
            Activate Maintenance Contract
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
            <div className="text-sm text-text-secondary mb-1">Activating for:</div>
            <div className="font-medium text-white">{subscription.service_name} ({subscription.service_identifier || 'N/A'})</div>
            <div className="text-sm text-text-secondary mt-1">Client: {subscription.customer_name}</div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
              {error}
            </div>
          )}

          <form id="maintenance-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Contract Start *</label>
              <input 
                type="date" 
                name="contract_start" 
                value={formData.contract_start}
                onChange={handleChange}
                required
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Contract End *</label>
              <input 
                type="date" 
                name="contract_end" 
                value={formData.contract_end}
                onChange={handleChange}
                required
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Contract Price</label>
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
              <label className="text-sm font-medium text-text-secondary">Notes</label>
              <textarea 
                name="notes" 
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Optional notes"
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
            form="maintenance-form"
            disabled={loading}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-soft-purple disabled:opacity-50"
          >
            {loading ? 'Activating...' : 'Activate Contract'}
          </button>
        </div>
      </div>
    </div>
  );
}
