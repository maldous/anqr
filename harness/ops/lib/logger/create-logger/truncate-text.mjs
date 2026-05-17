import { sanitizeText } from "./sanitize-text.mjs";

const MAX_LOG_STRING_LENGTH = 240;

export function truncateText(value, limit = MAX_LOG_STRING_LENGTH) {
  const text = sanitizeText(value);
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}
