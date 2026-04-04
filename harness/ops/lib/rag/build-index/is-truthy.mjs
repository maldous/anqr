// Generated from ../../../../scripts/ops/lib/rag/build-index.mjs:131

export function isTruthy(value) {
  if (typeof value !== "string") return false;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}
