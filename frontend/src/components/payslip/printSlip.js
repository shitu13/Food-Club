import { slipCss } from "./slipStyles";

// Page rules only apply inside the hidden print frame.
const pageCss = "@page { size: 80mm auto; margin: 3mm; } body { margin: 0; background: #fff; }";

// Prints one slip element through a hidden frame, so only the slip reaches the printer and not the dashboard.
export function printSlip(slipElement) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(frame);

  const cleanup = () => setTimeout(() => frame.remove(), 500);
  const frameWindow = frame.contentWindow;
  frameWindow.onafterprint = cleanup;

  const doc = frame.contentDocument;
  doc.open();
  doc.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>Food Club</title><style>${pageCss}${slipCss}</style></head><body>${slipElement.outerHTML}</body></html>`
  );
  doc.close();

  frameWindow.focus();
  frameWindow.print();
  // Some browsers never fire afterprint, so remove the frame anyway.
  setTimeout(() => frame.remove(), 60_000);
}
