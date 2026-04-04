// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:174

export function ensureString(value) {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
