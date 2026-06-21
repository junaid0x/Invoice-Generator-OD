import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, BarChart3, Settings, X } from 'lucide-react';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Invoices', path: '/invoices', icon: FileText },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-background border-r border-border transition-transform duration-300 ease-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-20 px-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary shadow-soft-purple flex items-center justify-center font-bold text-white tracking-wider text-sm">
              OD
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Ocean Dev</span>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-text-secondary hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <nav className="px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-secondary text-primary' 
                      : 'text-text-secondary hover:bg-secondary/50 hover:text-white'
                  }`
                }
              >
                <Icon 
                  size={18} 
                  className={`mr-3 transition-colors ${
                    item.path === window.location.pathname ? 'text-primary' : 'text-text-secondary group-hover:text-white'
                  }`} 
                />
                <span className="font-medium text-sm">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
