import { Search } from 'lucide-react';

export default function SearchInput({ className = '', ...props }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="text-text-secondary" size={18} />
      </div>
      <input
        type="text"
        className="w-full bg-secondary border border-border rounded-[var(--radius-input)] pl-10 pr-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        placeholder="Search..."
        {...props}
      />
    </div>
  );
}
