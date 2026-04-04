// Generated from ../../../../scripts/ops/integrations/model/symphony-adaptive-context.mjs:185

export function getHeaderValue(headers, key) {
  if (!headers) return null;
  if (typeof headers.get === "function") return headers.get(key);
  const lowerKey = key.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === lowerKey) return String(v);
  }
  return null;
}
