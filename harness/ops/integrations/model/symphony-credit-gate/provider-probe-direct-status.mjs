export function providerProbeDirectStatus(result) {
  return {
    directProbeStatus: result.status,
    directProbeReason: result.reason,
  };
}
