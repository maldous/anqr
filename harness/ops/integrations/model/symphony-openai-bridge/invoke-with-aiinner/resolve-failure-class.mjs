export function resolveFailureClass(hasErrors, finishReason) {
  if (hasErrors) return "stream_error";
  if (finishReason === "tool-calls") return "step_limit_reached";
  return null;
}
