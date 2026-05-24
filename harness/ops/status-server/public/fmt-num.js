export function fmtNum(n) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + "k";
  }
  return String(n);
}
