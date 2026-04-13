import { API_FIELD_PATTERNS } from "./constants.mjs";

export function extractContextLength(modelObj) {
  if (!modelObj || typeof modelObj !== "object") return null;
  // Try common field names
  for (const field of API_FIELD_PATTERNS) {
    const val = modelObj[field] || modelObj[field]?.toString?.();
    if (val && Number(val) > 0) return Number(val);
  }
  // Try nested fields
  const raw = modelObj.raw || modelObj.metadata || modelObj.info || {};
  for (const field of API_FIELD_PATTERNS) {
    const val = raw[field] || raw[field]?.toString?.();
    if (val && Number(val) > 0) return Number(val);
  }
  // Try OpenRouter-style pricing context
  if (modelObj.context_length) return Number(modelObj.context_length);
  return null;
}
