export function classifyProbeFailureStatus(errorText) {
  const text = String(errorText || "").toLowerCase();
  if (/payment required|credit|quota|402/.test(text)) return "quota_exhausted";
  if (/too many requests|rate limit|429/.test(text)) return "rate_limited";
  if (/unauthorized|forbidden|invalid api key|401|403/.test(text)) return "auth_invalid";
  if (/timeout|timed out|abort/.test(text)) return "timeout";
  return "provider_error";
}
