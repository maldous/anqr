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
        completed: false,
        needsContinuation: false,
        failureClass: "contract_missing",
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

  // Fail-closed: inference never produces completed:true — only explicit structured results can
  const completed = false;

  return normalizeSymphonyResult(
    {
      completed,
      needsContinuation,
      failureClass,
    },
    defaults,
  );
}
