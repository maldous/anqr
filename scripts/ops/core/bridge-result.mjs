function normalizeStringArray(value, fallback = []) {
  if (!Array.isArray(value)) return [...fallback];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeCount(value, fallback = 0) {
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function normalizeFailureClass(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function normalizeSymphonyResult(result = {}, defaults = {}) {
  const base = result && typeof result === "object" ? result : {};
  return {
    completed: base.completed === true,
    needsContinuation: base.needsContinuation === true,
    failureClass: normalizeFailureClass(base.failureClass),
    mutationCount: normalizeCount(base.mutationCount, defaults.mutationCount ?? 0),
    changedFiles: normalizeStringArray(base.changedFiles, defaults.changedFiles ?? []),
    validationIntent: base.validationIntent === true,
    toolCallCount: normalizeCount(base.toolCallCount, defaults.toolCallCount ?? 0),
    stepCount: normalizeCount(base.stepCount, defaults.stepCount ?? 0),
  };
}

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
