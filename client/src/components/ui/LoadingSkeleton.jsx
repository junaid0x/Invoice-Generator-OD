export default function LoadingSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="w-full animate-pulse">
      <div className="w-full overflow-x-auto bg-card border border-border rounded-[var(--radius-card)]">
        <table className="w-full text-left border-collapse">
          <thead className="border-b border-border bg-secondary/50">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-4 bg-secondary rounded w-24"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border/50">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="h-4 bg-secondary rounded w-full max-w-[150px]"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
