export function formatEvidenceForIssue(evidence) {
  const lines = [
    "## Incident Evidence",
    "",
    `**Timestamp:** ${evidence.timestamp}`,
    "",
  ];

  if (evidence.serviceName) {
    lines.push("### Service", `- **Name:** ${evidence.serviceName}`, "");
  }

  if (evidence.errorContext && Object.keys(evidence.errorContext).length > 0) {
    lines.push("### Error Context");
    for (const [key, value] of Object.entries(evidence.errorContext)) {
      lines.push(`- **${key}:** ${value}`);
    }
    lines.push("");
  }

  if (evidence.gitContext) {
    lines.push("### Git Context", `- **Commit:** \`${evidence.gitContext.commit}\``, `- **Branch:** ${evidence.gitContext.branch}`, `- **Uncommitted changes:** ${evidence.gitContext.hasUncommitted ? "Yes" : "No"}`, "");
  }

  if (evidence.systemInfo) {
    lines.push("### System Info", `- **Hostname:** ${evidence.systemInfo.hostname}`, `- **Uptime:** ${evidence.systemInfo.uptime}`, `- **Memory available:** ${evidence.systemInfo.memFree}`, "");
  }

  if (evidence.stateFile) {
    lines.push("### State File", `- **Size:** ${evidence.stateFile.size}`, `- **Last modified:** ${evidence.stateFile.modified}`, "");
  }

  if (evidence.providerHealth && Object.keys(evidence.providerHealth).length > 0) {
    lines.push("### Provider Health", "");
    for (const [provider, health] of Object.entries(evidence.providerHealth)) {
      lines.push(`**${provider}:**`, `- State: ${health.state}`, `- Consecutive failures: ${health.consecutiveFailures || 0}`, `- Consecutive successes: ${health.consecutiveSuccesses || 0}`);
      if (health.lastErrorType) {
        lines.push(`- Last error: ${health.lastErrorType}`);
      }
      lines.push("");
    }
  }

  if (evidence.journalLog) {
    lines.push("### Service Journal (last 100 lines)", "", "```", evidence.journalLog.trim(), "```", "");
  }

  return lines.join("\n");
}
