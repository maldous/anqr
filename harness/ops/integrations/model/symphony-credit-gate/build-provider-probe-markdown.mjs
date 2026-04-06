import { buildRankedHealthyMarkdownLines } from "./build-ranked-healthy-markdown-lines.mjs";
import { escapeProviderProbeMarkdownCell } from "./escape-provider-probe-markdown-cell.mjs";

export function buildProviderProbeMarkdown(report) {
  const lines = [];
  lines.push("# Provider probe diagnostics");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Providers probed: ${report.summary.total}`);
  lines.push(`- Healthy: ${report.summary.healthy}`);
  lines.push(`- Degraded: ${report.summary.degraded}`);
  lines.push(`- Failed: ${report.summary.failed}`);
  lines.push(`- Bridge-blocked: ${report.summary.bridgeBlocked}`);
  lines.push(
    `- Selector would choose: ${report.selector.wouldChoose ? `${report.selector.wouldChoose.providerName} via ${report.selector.wouldChoose.source} (${report.selector.wouldChoose.status})` : "none"}`,
  );
  lines.push("");
  lines.push(...buildRankedHealthyMarkdownLines(report.rankedHealthy));
  lines.push("## Tool-capability summary");
  lines.push("");
  lines.push(`- Confirmed tool-capable providers: ${report.toolSummary.total}`);
  lines.push(`- Confirmed tool-capable selectable: ${report.toolSummary.selectable}`);
  for (const entry of report.toolSummary.entries) {
    const detail = entry.detail ? `, detail: ${entry.detail}` : "";
    lines.push(
      `- ${entry.providerName}: ${entry.status}, bridge ${entry.bridgeStatus}, tool ${entry.toolStatus}, ${entry.reason}${detail}`,
    );
  }
  lines.push("");
  lines.push("## Provider results");
  lines.push("");
  lines.push(
    "| Provider | Model | Status | Duration ms | Reason | Routes | Bridge | Tool-capable | Tool probe | Tool detail |",
  );
  lines.push("|---|---|---:|---:|---|---|---|---|---|---|");
  for (const result of report.results) {
    lines.push(
      `| ${result.providerName} | ${result.model} | ${result.status} | ${result.durationMs} | ${escapeProviderProbeMarkdownCell(result.reason)} | ${result.routeInfo.advertisedRouteIds.join(", ") || "-"} | ${result.bridgeRoute.status}: ${escapeProviderProbeMarkdownCell(result.bridgeRoute.reason)} | ${result.routeInfo.knownToolCapable ? "yes" : "no"} | ${result.toolProbe?.toolStatus || "-"} | ${escapeProviderProbeMarkdownCell(result.toolProbe?.detail || "")} |`,
    );
  }
  lines.push("");
  lines.push("## Selector order");
  lines.push("");
  lines.push(
    "| Source | Provider | Status | Probe selectable | Bridge selectable | Selectable | Reason |",
  );
  lines.push("|---|---|---|---|---|---|---|");
  for (const entry of report.selector.sequence) {
    lines.push(
      `| ${entry.source} | ${entry.providerName} | ${entry.status} | ${entry.probeSelectable ? "yes" : "no"} | ${entry.bridgeSelectable ? "yes" : "no"} | ${entry.selectable ? "yes" : "no"} | ${escapeProviderProbeMarkdownCell(entry.reason)} |`,
    );
  }
  lines.push("");
  lines.push("## Failure breakdown");
  lines.push("");
  for (const [status, count] of Object.entries(report.failureBreakdown)) {
    lines.push(`- ${status}: ${count}`);
  }
  lines.push("");
  lines.push("## Codebuff providers");
  lines.push("");
  const codebuffProviders = report.results.filter((result) =>
    result.providerName.startsWith("codebuff"),
  );
  if (codebuffProviders.length === 0) {
    lines.push("- no codebuff providers present in provider registry");
  }
  for (const result of codebuffProviders) {
    lines.push(`- ${result.providerName}: status=${result.status}, reason=${result.reason}`);
    for (const stage of result.stages || []) {
      lines.push(
        `  - ${stage.name}${stage.mode ? ` (${stage.mode})` : ""}${stage.status ? ` [${stage.status}]` : ""}`,
      );
    }
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}
