// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:425

export function coerceOptionalNumberInput(value, fallback = undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}
