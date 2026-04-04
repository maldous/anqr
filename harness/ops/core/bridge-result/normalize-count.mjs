export function normalizeCount(value, fallback = 0) {
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}
