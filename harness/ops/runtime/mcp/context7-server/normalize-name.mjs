export function normalizeName(name) {
  return String(name || "")
    .trim()
    .toLowerCase();
}
