export default function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-bold text-navy">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {hint && !error && <p className="mt-1 text-xs text-navy-dark/60">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
