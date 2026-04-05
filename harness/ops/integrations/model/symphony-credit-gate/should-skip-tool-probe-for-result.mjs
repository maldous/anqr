const SKIP_TOOL_PROBE_STATUSES = new Set([
  "auth_missing",
  "auth_invalid",
  "quota_exhausted",
  "provider_error",
  "timeout",
]);

export function shouldSkipToolProbeForResult(result) {
  if (!result) return false;
  if (SKIP_TOOL_PROBE_STATUSES.has(result.status)) return true;
  if (result.available === false && result.status !== "degraded") return true;
  return false;
}
