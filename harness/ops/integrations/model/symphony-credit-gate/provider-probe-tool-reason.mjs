export function providerProbeToolReason(toolProbe) {
  if (!toolProbe) return "tool probe not run";
  return toolProbe.reason || toolProbe.detail || toolProbe.status || "unknown";
}
