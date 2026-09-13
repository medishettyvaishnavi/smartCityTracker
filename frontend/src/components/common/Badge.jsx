import "./Badge.css";

/**
 * Reusable Badge component for statuses, priorities, and categories
 *
 * @param {Object} props
 * @param {'status'|'priority'|'neutral'|'category'} [props.type='neutral']
 * @param {'pending'|'in-progress'|'resolved'|'low'|'medium'|'high'} [props.variant]
 * @param {string} [props.label]
 * @param {React.ReactNode} [props.icon]
 * @param {string} [props.className]
 */
export function Badge({ type = "neutral", variant, label, icon, children, className = "" }) {
  const variantClass = variant ? `badge-${type}-${variant}` : `badge-${type}`;

  return (
    <span className={`sct-badge ${variantClass} ${className}`}>
      {icon && <span className="sct-badge-icon" aria-hidden="true">{icon}</span>}
      <span className="sct-badge-text">{label || children}</span>
    </span>
  );
}

export default Badge;
