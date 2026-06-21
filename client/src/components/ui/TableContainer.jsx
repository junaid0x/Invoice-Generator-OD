export default function TableContainer({ children, className = '' }) {
  return (
    <div className={`w-full overflow-x-auto bg-card border border-border rounded-[var(--radius-card)] ${className}`}>
      <table className="w-full text-left border-collapse">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead className="border-b border-border bg-secondary/50">
      {children}
    </thead>
  );
}

export function TableRow({ children, className = '' }) {
  return (
    <tr className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function TableHeader({ children, className = '' }) {
  return (
    <th className={`px-6 py-4 text-xs font-semibold tracking-wider text-text-secondary uppercase ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={`px-6 py-4 text-sm text-text-primary whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
}
