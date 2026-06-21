export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="w-full bg-card border border-border border-dashed rounded-[var(--radius-card)] flex flex-col items-center justify-center p-12 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
          <Icon className="text-text-secondary" size={32} />
        </div>
      )}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-text-secondary max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
