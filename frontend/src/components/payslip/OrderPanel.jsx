import { buttonPrimary, buttonSecondary, inputClass } from "../dashboard/styles";
import Field from "../dashboard/Field";
import { formatPaisa, toPaisa } from "../../utils/money";
import { ORDER_TYPES } from "./orderTypes";
import Stepper from "./Stepper";

function Row({ label, value, strong }) {
  return (
    <div className={`flex justify-between gap-3 ${strong ? "text-xl font-extrabold text-navy" : "text-navy-dark/80"}`}>
      <dt>{label}</dt>
      <dd className={strong ? "" : "font-semibold"}>{value}</dd>
    </div>
  );
}

// The current order: customer details, the lines with counters, and the calculation.
export default function OrderPanel({ lines, meta, onMetaChange, totals, onQtyChange, onClear, onKitchenSlip, onCustomerSlip }) {
  const empty = lines.length === 0;

  return (
    <section aria-labelledby="order-title" className="rounded-3xl bg-white p-5 ring-1 ring-gold/40">
      <div className="flex items-center justify-between gap-3">
        <h2 id="order-title" className="text-xl font-extrabold">
          Current order
        </h2>
        <button type="button" onClick={onClear} disabled={empty && !meta.reference && !meta.note} className="text-sm font-bold text-red-700 underline decoration-red-300 decoration-2 underline-offset-4 disabled:opacity-40">
          New order
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Field label="Order type" htmlFor="order-type">
          <select id="order-type" value={meta.orderType} onChange={(e) => onMetaChange({ orderType: e.target.value })} className={inputClass}>
            {Object.entries(ORDER_TYPES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={meta.orderType === "dine-in" ? "Table (optional)" : "Customer (optional)"} htmlFor="order-reference">
          <input id="order-reference" value={meta.reference} maxLength={40} onChange={(e) => onMetaChange({ reference: e.target.value })} className={inputClass} />
        </Field>
      </div>

      <ul className="mt-4 divide-y divide-gold/30" aria-label="Order lines">
        {lines.map((line) => (
          <li key={line.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate font-bold text-navy">{line.name.en}</p>
              <p className="text-sm text-navy-dark/70">
                {formatPaisa(toPaisa(line.price))} each · <span className="font-semibold">{formatPaisa(toPaisa(line.price) * line.qty)}</span>
              </p>
            </div>
            <Stepper name={line.name.en} qty={line.qty} onChange={(qty) => onQtyChange(line.id, qty)} />
          </li>
        ))}
      </ul>
      {empty && <p className="mt-4 rounded-2xl bg-tint px-4 py-5 text-center text-navy-dark/70">No dishes yet. Tap Add on a dish to start the order.</p>}

      <div className="mt-4">
        <Field label="Note for the kitchen (optional)" htmlFor="order-note">
          <textarea id="order-note" rows={2} maxLength={200} value={meta.note} onChange={(e) => onMetaChange({ note: e.target.value })} placeholder="For example: less spicy" className={inputClass} />
        </Field>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Field label="Discount (৳)" htmlFor="order-discount" error={totals.discountWasCapped ? `Discount cannot be more than the subtotal. Using ${formatPaisa(totals.discount)}.` : ""}>
          <input id="order-discount" type="number" inputMode="decimal" min="0" step="0.01" value={meta.discount} onChange={(e) => onMetaChange({ discount: e.target.value })} className={inputClass} />
        </Field>
        <Field label="VAT (%)" htmlFor="order-vat">
          <input id="order-vat" type="number" inputMode="decimal" min="0" max="100" step="0.01" value={meta.vat} onChange={(e) => onMetaChange({ vat: e.target.value })} className={inputClass} />
        </Field>
      </div>

      <dl className="mt-5 space-y-2 rounded-2xl bg-tint p-4" aria-label="Calculation">
        <Row label={`Subtotal (${totals.itemCount} ${totals.itemCount === 1 ? "item" : "items"})`} value={formatPaisa(totals.subtotal)} />
        {totals.discount > 0 && <Row label="Discount" value={`− ${formatPaisa(totals.discount)}`} />}
        {totals.vat > 0 && <Row label={`VAT (${totals.rate}%)`} value={formatPaisa(totals.vat)} />}
        <div className="border-t-2 border-navy/20 pt-2">
          <Row strong label="Total" value={formatPaisa(totals.total)} />
        </div>
      </dl>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <button type="button" onClick={onKitchenSlip} disabled={empty} className={buttonSecondary}>
          Kitchen order slip
        </button>
        <button type="button" onClick={onCustomerSlip} disabled={empty} className={buttonPrimary}>
          Customer pay slip
        </button>
      </div>
    </section>
  );
}
