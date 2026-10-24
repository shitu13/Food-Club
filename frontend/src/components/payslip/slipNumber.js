const KEY = "food-club-slip-counter";

const today = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
};

// Order numbers restart every day: 20261024-001, 20261024-002 ...
// The counter lives in this browser, so two devices taking orders can repeat a number.
export function nextSlipNumber() {
  const day = today();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    const seq = saved?.day === day ? saved.seq + 1 : 1;
    localStorage.setItem(KEY, JSON.stringify({ day, seq }));
    return `${day}-${String(seq).padStart(3, "0")}`;
  } catch {
    return `${day}-${String(Date.now()).slice(-4)}`;
  }
}
