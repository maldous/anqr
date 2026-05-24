export function ago(ts) {
  if (!ts) return "";
  const s = Math.round((Date.now() - ts) / 1000);
  return s < 60 ? `${s}s ago` : `${Math.round(s/60)}m ago`;
}
