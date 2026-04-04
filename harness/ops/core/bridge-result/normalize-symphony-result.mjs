import { normalizeCount } from "./normalize-count.mjs";
import { normalizeFailureClass } from "./normalize-failure-class.mjs";
import { normalizeStringArray } from "./normalize-string-array.mjs";

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
