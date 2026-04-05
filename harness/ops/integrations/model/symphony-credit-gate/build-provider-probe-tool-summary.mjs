export function buildProviderProbeToolSummary(results) {
  const entries = results.map((result) => ({
    providerName: result.providerName,
    status: result.status,
    bridgeStatus: result.bridgeRoute.status,
    toolStatus: result.toolProbe?.toolStatus || 'not_probed',
    reason: result.toolProbe?.reason || result.reason,
    detail: result.toolProbe?.detail || null,
    rawStatus: result.toolProbe?.status || null,
  }));

  return {
    total: entries.filter((entry) => entry.toolStatus === 'capable').length,
    selectable: results.filter((result) => ['success', 'degraded'].includes(result.status) && result.bridgeRoute.status === 'advertised' && result.toolProbe?.toolStatus === 'capable').length,
    entries,
  };
}
