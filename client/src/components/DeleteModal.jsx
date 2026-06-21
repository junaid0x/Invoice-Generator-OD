import { X, AlertTriangle } from 'lucide-react';
import Button from './ui/Button';

export default function DeleteModal({ isOpen, onClose, onConfirm, title, message, isLoading = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border w-full max-w-md rounded-[var(--radius-card)] shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="text-danger" size={24} />
            {title || 'Confirm Deletion'}
          </h2>
          <button onClick={onClose} className="p-2 text-text-secondary hover:text-white rounded-full hover:bg-secondary transition-colors" disabled={isLoading}>
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 text-text-secondary leading-relaxed">
          {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
        </div>
        
        <div className="p-6 border-t border-border flex justify-end gap-3 bg-secondary/30">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}
