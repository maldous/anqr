export function buildRankedHealthyMarkdownLines(rankedProviders, providerStats, probeResults) {
  const lines = [];
  lines.push('## Healthy ranked pool');
  lines.push('');
  lines.push('| Rank | Provider | Model | Tier | Score | Selections | Success rate | Probe selections | Probe successes | Probe failures | Probe avg ms | Reason |');
  lines.push('|---:|---|---|---|---|---:|---:|---:|---:|---:|---:|---|');
  const byName = new Map(probeResults.map((result) => [result.providerName, result]));
  for (const entry of rankedProviders) {
    const stats = providerStats[entry.name] || {};
    const result = byName.get(entry.name);
    if (!result) continue;
    const directOk = result.status === 'success' || result.status === 'degraded';
    const toolOk = result.toolProbe ? ['capable', 'sdk-capable', 'known-capable', 'safety-net-always-allowed'].includes(result.toolProbe.status) : result.routeInfo?.knownToolCapable;
    if (!directOk || !toolOk) continue;
    lines.push(`| ${entry.rank} | ${entry.name} | ${result.model} | ${entry.tier} | ${entry.score} | ${stats.selections || 0} | ${stats.successRate || '0%'} | ${stats.probeSelections || 0} | ${stats.probeSuccesses || 0} | ${stats.probeFailures || 0} | ${stats.probeAvgDurationMs || 0} | ${result.reason} |`);
  }
  lines.push('');
  return lines;
}
