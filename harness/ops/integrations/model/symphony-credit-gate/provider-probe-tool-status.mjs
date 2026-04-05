export function providerProbeToolStatus(toolProbe) {
  if (!toolProbe) return 'not_probed';
  const status = toolProbe.status || 'unknown';
  if (['capable', 'sdk-capable', 'known-capable', 'safety-net-always-allowed'].includes(status)) return 'capable';
  if (['rate-limited', 'no-tool-call', 'infrastructure-error', 'probe-error', 'timeout'].includes(status)) return 'inconclusive';
  if (['non-capable-raw-json', 'non-capable-rejected'].includes(status)) return 'non_capable';
  return status;
}
