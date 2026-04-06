const INVALID_SENTINELS = new Set([
  "NO_REPLY",
  "NO_RESPONSE",
  "NO_ANSWER",
  "NO_OUTPUT",
  "UNABLE_TO_REPLY",
]);

export function isInvalidModelAnswerText(text, options = {}) {
  if (options.allowSentinel === true) return false;
  const normalized = String(text || "").trim();
  if (!normalized) return true;
  const collapsed = normalized.replace(/\s+/g, " ").toUpperCase();
  return INVALID_SENTINELS.has(collapsed);
}
