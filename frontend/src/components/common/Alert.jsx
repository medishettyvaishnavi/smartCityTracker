import "./Alert.css";

/**
 * Reusable Alert banner component
 *
 * @param {Object} props
 * @param {'info'|'success'|'warning'|'error'} [props.type='error']
 * @param {string} [props.message]
 * @param {React.ReactNode} [props.children]
 * @param {Function} [props.onClose]
 * @param {string} [props.className]
 */
export function Alert({ type = "error", message, children, onClose, className = "" }) {
  const icons = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };

  return (
    <div className={`sct-alert sct-alert-${type} ${className}`} role="alert">
      <span className="sct-alert-icon" aria-hidden="true">{icons[type] || "⚠️"}</span>
      <div className="sct-alert-content">{message || children}</div>
      {onClose && (
        <button
          type="button"
          className="sct-alert-close"
          onClick={onClose}
          aria-label="Dismiss alert"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default Alert;
