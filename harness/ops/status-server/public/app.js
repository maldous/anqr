function fmtNum(n) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + "k";
  }
  return String(n);
}

function ago(ts) {
  if (!ts) return "";
  const s = Math.round((Date.now() - ts) / 1000);
  return s < 60 ? `${s}s ago` : `${Math.round(s/60)}m ago`;
}