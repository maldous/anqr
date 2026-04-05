export function hasHistoricalProviderCapability(providerName, stats) {
  return Boolean(
    (stats.successes?.[providerName] || 0) > 0 ||
    (stats.probeSuccesses?.[providerName] || 0) > 0 ||
    stats.lastSuccess?.[providerName],
  );
}
