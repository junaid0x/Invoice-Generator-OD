import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, User, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Navbar({ toggleSidebar }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDemo = user?.is_demo || user?.email === 'admin@example.com';

  const handleResetDemo = async () => {
    try {
      await api.post('/auth/demo-reset');
      window.location.reload();
    } catch (err) {
      alert('Failed to reset demo data');
    }
  };

  return (
    <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sm:px-10 z-10 sticky top-0">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="md:hidden mr-4 p-2 text-text-secondary hover:text-white hover:bg-secondary rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-3">
          <h1 className="text-base font-medium text-text-secondary tracking-wide">
            Invoice Suite
          </h1>
          {isDemo && (
            <span className="bg-primary/20 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary/30 flex items-center gap-1">
              ✨ Demo Workspace
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-text-secondary hover:text-white hover:bg-secondary rounded-full transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full shadow-soft-purple"></span>
        </button>
        
        <div className="h-6 w-px bg-border mx-1"></div>

        {isAuthenticated && (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-2 py-1 rounded-full hover:bg-secondary transition-colors group"
            >
              <div className="hidden md:flex flex-col items-end mr-1">
                <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                  {user?.name || 'Administrator'}
                </span>
                {isDemo && (
                  <span className="text-[10px] text-primary font-medium">Demo Mode</span>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-text-secondary group-hover:border-primary/30 transition-colors">
                <User size={16} />
              </div>
              <ChevronDown size={14} className="text-text-secondary group-hover:text-primary transition-colors" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-[var(--radius-input)] shadow-lg py-1 z-50 overflow-hidden divide-y divide-border">
                {isDemo && (
                  <button 
                    onClick={handleResetDemo}
                    className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span>Reset Demo Data</span>
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
