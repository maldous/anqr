import { escapeProviderProbeMarkdownCell } from "./escape-provider-probe-markdown-cell.mjs";

export function buildRankedHealthyMarkdownLines(rankedHealthy) {
  const lines = ["## Healthy ranked pool", ""];
  lines.push(
    "| Rank | Provider | Model | Tier | Score | Selections | Success rate | Probe selections | Probe successes | Probe failures | Probe avg ms | Reason |",
  );
  lines.push("|---:|---|---|---|---|---:|---:|---:|---:|---:|---:|---|");
  for (const entry of rankedHealthy || []) {
    lines.push(
      `| ${entry.rank ?? "-"} | ${entry.providerName} | ${escapeProviderProbeMarkdownCell(entry.model)} | ${entry.tier} | ${entry.score} | ${entry.selections} | ${entry.successRate} | ${entry.probeSelections} | ${entry.probeSuccesses} | ${entry.probeFailures} | ${entry.probeAvgDurationMs} | ${escapeProviderProbeMarkdownCell(entry.reason)} |`,
    );
  }
  if (!Array.isArray(rankedHealthy) || rankedHealthy.length === 0) {
    lines.push(
      "| - | none | - | - | - | 0 | 0% | 0 | 0 | 0 | 0 | no historically healthy selectable providers |",
    );
  }
  lines.push("");
  return lines;
}
