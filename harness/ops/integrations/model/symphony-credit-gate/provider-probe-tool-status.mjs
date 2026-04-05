export function providerProbeToolStatus(toolProbe) {
  if (!toolProbe) return "not_probed";
  const status = toolProbe.status || "unknown";
  if (["capable", "sdk-capable", "known-capable", "safety-net-always-allowed"].includes(status))
    return "capable";
  if (
    [
      "catalog-declared-non-capable",
      "non-capable-raw-json",
      "non-capable-rejected",
      "answered-without-tool-call",
    ].includes(status)
  )
    return "non_capable";
  if (
    [
      "rate-limited",
      "no-tool-call",
      "infrastructure-error",
      "probe-error",
      "timeout",
      "invalid-json-response",
    ].includes(status)
  )
    return "inconclusive";
  return status;
}
