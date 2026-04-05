export function isTransientProviderFailureType(errorType) {
  const value = String(errorType || "").toLowerCase();
  return (
    value === "rate_limited" ||
    value === "timeout" ||
    value === "provider_error" ||
    value === "unknown"
  );
}
