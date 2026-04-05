export function buildProviderProbeFailureBreakdown(results) {
  const breakdown = {};
  for (const result of results) {
    breakdown[result.status] = (breakdown[result.status] || 0) + 1;
  }
  return breakdown;
}
