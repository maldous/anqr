// Generated from ../../../scripts/ops/core/symphony-validation.mjs:43

export function trimOutput(text, max = 6000) {
  const value = String(text || "").trim();
  return value.length > max ? `${value.slice(0, max)}\n... (truncated)` : value;
}
