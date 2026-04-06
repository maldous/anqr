export function parseWorktreeNumber(wtId) {
  const cleaned = String(wtId || "").replace(/^wt/i, "");
  const num = parseInt(cleaned || "1", 10);
  return Number.isFinite(num) && num >= 1 ? num : 1;
}
