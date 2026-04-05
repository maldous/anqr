export function classifyProviderProbeHttpStatus(status) {
  if (status === 401 || status === 403) return { status: "auth_invalid", reason: `HTTP ${status}` };
  if (status === 402) return { status: "quota_exhausted", reason: `HTTP ${status}` };
  if (status === 408 || status === 504) return { status: "timeout", reason: `HTTP ${status}` };
  if (status === 429) return { status: "rate_limited", reason: `HTTP ${status}` };
  if (status >= 500) return { status: "provider_error", reason: `HTTP ${status}` };
  return { status: "unavailable", reason: `HTTP ${status}` };
}
