import "./Spinner.css";

/**
 * Reusable loading spinner component
 *
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.color] - Custom CSS color or var()
 * @param {string} [props.className]
 */
export function Spinner({ size = "md", color, className = "" }) {
  return (
    <span
      className={`sct-spinner sct-spinner-${size} ${className}`}
      style={color ? { borderTopColor: color } : undefined}
      role="status"
      aria-label="Loading"
    />
  );
}

export default Spinner;
