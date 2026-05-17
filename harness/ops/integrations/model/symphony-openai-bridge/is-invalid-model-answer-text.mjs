const INVALID_SENTINELS = new Set([
  "NO_REPLY",
  "NO_RESPONSE",
  "NO_ANSWER",
  "NO_OUTPUT",
  "UNABLE_TO_REPLY",
]);

export function isInvalidModelAnswerText(text, options = {}) {
  function normalizeLine(value) {
    return String(value || "")
      .trim()
      .replaceAll(/^```[\w-]*\s*/gi, "")
      .replaceAll(/```$/gi, "")
      .replaceAll(/\s+/g, " ")
      .toUpperCase();
  }

  if (options.allowSentinel === true) return false;
  const normalized = String(text || "").trim();
  if (!normalized) return true;

  const collapsed = normalizeLine(normalized);
  if (INVALID_SENTINELS.has(collapsed)) return true;

  const firstNonEmptyLine = normalizeLine(
    normalized
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean) || "",
  );
  if (INVALID_SENTINELS.has(firstNonEmptyLine)) return true;

  for (const sentinel of INVALID_SENTINELS) {
    if (collapsed.startsWith(`${sentinel} `) || collapsed.startsWith(`${sentinel}:`)) {
      return true;
    }
  }

  return false;
}
