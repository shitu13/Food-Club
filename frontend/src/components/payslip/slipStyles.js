// Plain CSS on purpose: the same string is used for the on-screen preview and for the print window,
// so the slip looks the same on screen and on paper (built for 80 mm receipt printers, fine on A4 too).
// Every rule starts with .slip so it cannot change anything else in the dashboard.
export const slipCss = `
.slip, .slip * { box-sizing: border-box; }
.slip { width: 72mm; margin: 0 auto; padding: 2mm 0; color: #000; background: #fff; font: 13px/1.4 Arial, "Noto Sans Bengali", sans-serif; }
.slip-center { text-align: center; }
.slip-brand { font-size: 20px; font-weight: 800; letter-spacing: .5px; margin: 0; }
.slip-title { margin: 6px 0 0; font-size: 15px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
.slip-small { font-size: 11px; }
.slip-muted { color: #444; }
.slip-rule { border: 0; border-top: 1px dashed #000; margin: 8px 0; }
.slip-meta { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; }
.slip-meta span:last-child { text-align: right; font-weight: 700; }
.slip-group { margin: 10px 0 2px; font-size: 12px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 2px; }
.slip-kitchen-line { display: flex; gap: 8px; margin: 6px 0; font-size: 16px; font-weight: 800; }
.slip-kitchen-line .qty { min-width: 34px; }
.slip-kitchen-line .bn { display: block; font-size: 12px; font-weight: 400; }
.slip-line { margin: 6px 0; }
.slip-line-top { display: flex; justify-content: space-between; gap: 8px; font-weight: 700; }
.slip-line-sub { font-size: 11px; color: #444; }
.slip-row { display: flex; justify-content: space-between; gap: 8px; margin: 3px 0; }
.slip-total { font-size: 17px; font-weight: 800; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 0; margin-top: 6px; }
.slip-note { margin-top: 8px; padding: 4px 6px; border: 1px solid #000; font-weight: 700; white-space: pre-wrap; overflow-wrap: anywhere; }
.slip-foot { margin-top: 10px; font-size: 11px; text-align: center; }
`;
