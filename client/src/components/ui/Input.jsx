export default function Input({ className = '', labelClassName = '', label, error, ...props }) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className={`text-sm font-medium text-text-secondary ${labelClassName}`}>{label}</label>}
      <input 
        className={`w-full bg-secondary border border-border rounded-[var(--radius-input)] px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ${error ? 'border-danger focus:border-danger focus:ring-danger' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-danger mt-1">{error}</span>}
    </div>
  );
}
