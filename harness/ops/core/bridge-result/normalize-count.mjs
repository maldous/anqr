// Generated from ../../../scripts/ops/core/bridge-result.mjs:9

export function normalizeCount(value, fallback = 0) {
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}
