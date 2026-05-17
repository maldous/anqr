export function shouldWarnForStatus(status) {
  return !new Set([
    "non-capable-rejected",
    "failed-function-call",
    "quota-exhausted",
    "auth-invalid",
    "unavailable-model",
    "bad-request",
  ]).has(status);
}
