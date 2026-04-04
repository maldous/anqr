import { normalizeSymphonyResult } from "./normalize-symphony-result.mjs";

export function inferSymphonyResultFromCompletion({
  existingResult = null,
  finishReason = null,
  text = "",
  allowTextOnlyCompletion = false,
  defaults = {},
} = {}) {
  if (existingResult && typeof existingResult === "object") {
    return normalizeSymphonyResult(existingResult, defaults);
  }

  const normalizedReason =
    typeof finishReason === "string" && finishReason.trim()
      ? finishReason.trim().toLowerCase()
      : null;
  const hasText = typeof text === "string" && text.trim().length > 0;

  if (!normalizedReason) {
    if (!allowTextOnlyCompletion || !hasText) return null;
    return normalizeSymphonyResult(
      {
        completed: true,
        needsContinuation: false,
        failureClass: null,
      },
      defaults,
    );
  }

  const needsContinuation =
    normalizedReason === "length" ||
    normalizedReason === "tool_calls" ||
    normalizedReason === "tool-calls";

  const failureClass =
    normalizedReason === "tool_calls" || normalizedReason === "tool-calls"
      ? "step_limit_reached"
      : null;

  const completed = normalizedReason === "stop" && !needsContinuation && !failureClass && hasText;

  return normalizeSymphonyResult(
    {
      completed,
      needsContinuation,
      failureClass,
    },
    defaults,
  );
}
