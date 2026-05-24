import { sanitizeValue } from "./sanitize-value.mjs";
import { truncateText } from "./truncate-text.mjs";

export function safeSerialize(data) {
  if (data === null || data === undefined) {
    return "";
  }
  try {
    return JSON.stringify(sanitizeValue(data));
  } catch (err) {
    return `[serialization failed: ${truncateText(err?.message || String(err), 120)}]`;
  }
}
