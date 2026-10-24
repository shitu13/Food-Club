import { forwardRef } from "react";
import en from "../../i18n/en";
import { restaurant } from "../../data/navigation";
import { formatPaisa, toPaisa } from "../../utils/money";
import { ORDER_TYPES } from "./orderTypes";

const formatWhen = (date) => date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

function Meta({ slip }) {
  return (
    <>
      <div className="slip-meta">
        <span>Order no.</span>
        <span>{slip.number}</span>
      </div>
      <div className="slip-meta">
        <span>Date</span>
        <span>{formatWhen(slip.issuedAt)}</span>
      </div>
      <div className="slip-meta">
        <span>Type</span>
        <span>{ORDER_TYPES[slip.orderType]}</span>
      </div>
      {slip.reference && (
        <div className="slip-meta">
          <span>{slip.orderType === "dine-in" ? "Table" : "Customer"}</span>
          <span>{slip.reference}</span>
        </div>
      )}
    </>
  );
}

// What the kitchen sees: no prices, big quantities, items grouped by menu.
function KitchenSlip({ slip }) {
  return (
    <>
      <div className="slip-center">
        <p className="slip-brand">{restaurant.name}</p>
        <p className="slip-title">Kitchen order</p>
      </div>
      <hr className="slip-rule" />
      <Meta slip={slip} />

      {slip.groups.map((group) => (
        <section key={group.id}>
          <p className="slip-group">{group.name}</p>
          {group.lines.map((line) => (
            <div key={line.id} className="slip-kitchen-line">
              <span className="qty">{line.qty} ×</span>
              <span>
                {line.name.en}
                {line.name.bn && <span className="bn">{line.name.bn}</span>}
              </span>
            </div>
          ))}
        </section>
      ))}

      {slip.note && <p className="slip-note">Note: {slip.note}</p>}
      <hr className="slip-rule" />
      <p className="slip-center slip-small">Total items: {slip.totals.itemCount}</p>
    </>
  );
}

// What the customer receives: prices, line totals and the calculation.
function CustomerSlip({ slip }) {
  const { totals } = slip;
  return (
    <>
      <div className="slip-center">
        <p className="slip-brand">{restaurant.name}</p>
        <p className="slip-small slip-muted">{en.address}</p>
        <p className="slip-small slip-muted">{restaurant.phones.join(" / ")}</p>
        <p className="slip-title">Pay slip</p>
      </div>
      <hr className="slip-rule" />
      <Meta slip={slip} />
      <hr className="slip-rule" />

      {slip.groups.flatMap((group) => group.lines).map((line) => (
        <div key={line.id} className="slip-line">
          <div className="slip-line-top">
            <span>{line.name.en}</span>
            <span>{formatPaisa(toPaisa(line.price) * line.qty)}</span>
          </div>
          <div className="slip-line-sub">
            {line.qty} × {formatPaisa(toPaisa(line.price))}
          </div>
        </div>
      ))}

      <hr className="slip-rule" />
      <div className="slip-row">
        <span>Subtotal ({totals.itemCount} items)</span>
        <span>{formatPaisa(totals.subtotal)}</span>
      </div>
      {totals.discount > 0 && (
        <div className="slip-row">
          <span>Discount</span>
          <span>− {formatPaisa(totals.discount)}</span>
        </div>
      )}
      {totals.vat > 0 && (
        <div className="slip-row">
          <span>VAT ({totals.rate}%)</span>
          <span>{formatPaisa(totals.vat)}</span>
        </div>
      )}
      <div className="slip-row slip-total">
        <span>Total</span>
        <span>{formatPaisa(totals.total)}</span>
      </div>

      <p className="slip-foot">Thank you for dining with us. Good food, good mood!</p>
    </>
  );
}

const SlipDocument = forwardRef(function SlipDocument({ slip }, ref) {
  return (
    <div ref={ref} className="slip">
      {slip.kind === "kitchen" ? <KitchenSlip slip={slip} /> : <CustomerSlip slip={slip} />}
    </div>
  );
});

export default SlipDocument;
