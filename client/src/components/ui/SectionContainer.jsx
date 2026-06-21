export default function SectionContainer({ children, className = '' }) {
  return (
    <div className={`mt-8 space-y-6 ${className}`}>
      {children}
    </div>
  );
}
