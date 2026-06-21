export default function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none rounded-[var(--radius-button)]";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-soft-purple hover:shadow-soft-purple-hover px-6 py-2.5",
    secondary: "bg-card border border-border text-text-primary hover:bg-border/50 px-6 py-2.5",
    danger: "bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20 px-6 py-2.5",
    ghost: "text-text-secondary hover:text-white hover:bg-card px-4 py-2",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
