export default function InvoiceTerms({ terms, onChange }) {
  return (
    <div className="w-full">
      <label className="block text-xs font-semibold tracking-wider uppercase text-text-secondary mb-1.5">Terms & Conditions</label>
      <textarea
        value={terms || ''}
        onChange={(e) => onChange(e.target.value)}
        rows="3"
        className="w-full bg-secondary border border-border rounded-[var(--radius-input)] px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y min-h-[80px]"
        placeholder="Late fees apply after 30 days..."
      ></textarea>
    </div>
  );
}
