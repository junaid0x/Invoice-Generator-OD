import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import Button from './ui/Button';
import { Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function DemoWelcomeModal() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const isDemoUser = user?.is_demo || user?.email === 'admin@example.com';

  useEffect(() => {
    if (isDemoUser) {
      const hasSeen = localStorage.getItem('has_seen_demo_welcome');
      if (!hasSeen) {
        setIsOpen(true);
      }
    }
  }, [isDemoUser]);

  const handleClose = () => {
    localStorage.setItem('has_seen_demo_welcome', 'true');
    setIsOpen(false);
  };

  const handleResetData = async () => {
    try {
      setIsResetting(true);
      await api.post('/auth/demo-reset');
      window.location.reload();
    } catch (err) {
      alert('Failed to reset demo data');
    } finally {
      setIsResetting(false);
    }
  };

  if (!isOpen || !isDemoUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card border border-primary/40 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/20 text-primary rounded-xl shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              Demo Environment
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              👋 Welcome to the Ocean Developers Invoice Management System
            </h2>
          </div>
        </div>

        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <p>
            This is a fully interactive demo environment.
          </p>
          <p>
            Feel free to create, edit and explore customers, invoices and subscriptions.
          </p>
          <p className="text-white font-medium">
            Any changes you make are isolated from production data and can be safely reset.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetData}
            disabled={isResetting}
            className="w-full sm:w-auto text-xs text-text-secondary hover:text-white flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
          >
            <RefreshCw size={14} className={isResetting ? 'animate-spin' : ''} />
            {isResetting ? 'Resetting Data...' : 'Reset Demo Data'}
          </button>

          <Button
            variant="primary"
            className="w-full sm:w-auto px-6 py-2.5 font-semibold text-white shadow-soft-purple"
            onClick={handleClose}
          >
            Start Exploring
          </Button>
        </div>
      </div>
    </div>
  );
}
