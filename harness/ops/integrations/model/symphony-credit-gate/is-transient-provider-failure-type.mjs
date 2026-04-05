export function isTransientProviderFailureType(errorType) {
  const text = String(errorType || "").toLowerCase();
  return (
    text === "rate_limited" ||
    text === "timeout" ||
    text === "network_error" ||
    text === "provider_error"
  );
}
