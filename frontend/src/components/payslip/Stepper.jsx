export const MAX_QTY = 99;

const stepButton =
  "flex h-9 w-9 items-center justify-center rounded-full border-2 border-navy text-lg font-extrabold leading-none text-navy hover:bg-navy hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-navy";

// The − qty + counter used on every dish and every order line.
export default function Stepper({ name, qty, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" aria-label={`Remove one ${name}`} disabled={qty <= 0} onClick={() => onChange(qty - 1)} className={stepButton}>
        −
      </button>
      <span aria-live="polite" aria-label={`${name} quantity`} className="min-w-6 text-center font-display text-lg font-extrabold text-navy">
        {qty}
      </span>
      <button type="button" aria-label={`Add one ${name}`} disabled={qty >= MAX_QTY} onClick={() => onChange(qty + 1)} className={stepButton}>
        +
      </button>
    </div>
  );
}
