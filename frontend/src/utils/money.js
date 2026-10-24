// Money is calculated in paisa (whole numbers) so totals never show floating point errors like 0.30000000000000004.
export const toPaisa = (value) => Math.round(Number(value || 0) * 100);

export const formatPaisa = (paisa) =>
  `৳${(paisa / 100).toLocaleString("en-US", {
    minimumFractionDigits: paisa % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

// lines: [{ price, qty }]. Discount is a fixed amount in taka, VAT is a percentage of what is left after the discount.
export function calcTotals(lines, discountInput = "", vatInput = "") {
  const subtotal = lines.reduce((sum, line) => sum + toPaisa(line.price) * line.qty, 0);
  const requestedDiscount = Math.max(toPaisa(discountInput), 0);
  const discount = Math.min(requestedDiscount, subtotal);
  const taxable = subtotal - discount;
  const rate = Math.min(Math.max(Number(vatInput) || 0, 0), 100);
  const vat = Math.round((taxable * rate) / 100);

  return {
    subtotal,
    discount,
    discountWasCapped: requestedDiscount > subtotal,
    vat,
    rate,
    total: taxable + vat,
    itemCount: lines.reduce((sum, line) => sum + line.qty, 0),
  };
}
