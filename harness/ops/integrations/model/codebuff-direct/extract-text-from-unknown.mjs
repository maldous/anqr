// Generated from ../../../../scripts/ops/integrations/model/codebuff-direct.mjs:136

export function extractTextFromUnknown(value, parts = []) {
  if (value == null) return parts;
  if (typeof value === "string") {
    if (value.trim()) parts.push(value);
    return parts;
  }
  if (Array.isArray(value)) {
    for (const item of value) extractTextFromUnknown(item, parts);
    return parts;
  }
  if (typeof value === "object") {
    const fields = ["text", "content", "reasoning", "result", "message", "output"];
    for (const field of fields) {
      if (field in value) extractTextFromUnknown(value[field], parts);
    }
    if (parts.length === 0) {
      for (const nested of Object.values(value)) {
        extractTextFromUnknown(nested, parts);
      }
    }
    return parts;
  }
  parts.push(String(value));
  return parts;
}
