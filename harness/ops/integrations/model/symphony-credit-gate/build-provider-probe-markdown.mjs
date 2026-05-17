import { buildRankedHealthyMarkdownLines } from "./build-ranked-healthy-markdown-lines.mjs";
import { escapeProviderProbeMarkdownCell } from "./escape-provider-probe-markdown-cell.mjs";

export function buildProviderProbeMarkdown(report) {
  const lines = [
    "# Provider probe diagnostics",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Summary",
    "",
    `- Providers probed: ${report.summary.total}`,
    `- Healthy: ${report.summary.healthy}`,
    `- Degraded: ${report.summary.degraded}`,
    `- Failed: ${report.summary.failed}`,
    `- Bridge-blocked: ${report.summary.bridgeBlocked}`,
    `- Selector would choose: ${report.selector.wouldChoose ? `${report.selector.wouldChoose.providerName} via ${report.selector.wouldChoose.source} (${report.selector.wouldChoose.status})` : "none"}`,
    "",
    ...buildRankedHealthyMarkdownLines(report.rankedHealthy),
    "## Tool-capability summary",
    "",
    `- Confirmed tool-capable providers: ${report.toolSummary.total}`,
    `- Confirmed tool-capable selectable: ${report.toolSummary.selectable}`,
  ];
  for (const entry of report.toolSummary.entries) {
    const detail = entry.detail ? `, detail: ${entry.detail}` : "";
    lines.push(
      `- ${entry.providerName}: ${entry.status}, bridge ${entry.bridgeStatus}, tool ${entry.toolStatus}, ${entry.reason}${detail}`,
    );
  }
  lines.push("", "## Provider results", "");
  lines.push(
    "| Provider | Model | Status | Duration ms | Reason | Routes | Bridge | Tool-capable | Tool probe | Tool detail |",
    "|---|---|---:|---:|---|---|---|---|---|---|",
  );
  for (const result of report.results) {
    lines.push(
      `| ${result.providerName} | ${result.model} | ${result.status} | ${result.durationMs} | ${escapeProviderProbeMarkdownCell(result.reason)} | ${result.routeInfo.advertisedRouteIds.join(", ") || "-"} | ${result.bridgeRoute.status}: ${escapeProviderProbeMarkdownCell(result.bridgeRoute.reason)} | ${result.routeInfo.knownToolCapable ? "yes" : "no"} | ${result.toolProbe?.toolStatus || "-"} | ${escapeProviderProbeMarkdownCell(result.toolProbe?.detail || "")} |`,
    );
  }
  lines.push("", "## Selector order", "");
  lines.push(
    "| Source | Provider | Status | Probe selectable | Bridge selectable | Selectable | Reason |",
    "|---|---|---|---|---|---|---|",
  );
  for (const entry of report.selector.sequence) {
    lines.push(
      `| ${entry.source} | ${entry.providerName} | ${entry.status} | ${entry.probeSelectable ? "yes" : "no"} | ${entry.bridgeSelectable ? "yes" : "no"} | ${entry.selectable ? "yes" : "no"} | ${escapeProviderProbeMarkdownCell(entry.reason)} |`,
    );
  }
  lines.push("", "## Failure breakdown", "");
  for (const [status, count] of Object.entries(report.failureBreakdown)) {
    lines.push(`- ${status}: ${count}`);
  }
  lines.push("", "## Codebuff providers", "");
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
