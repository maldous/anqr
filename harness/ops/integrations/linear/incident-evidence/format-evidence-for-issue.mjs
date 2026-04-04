export function formatEvidenceForIssue(evidence) {
  const lines = [];

  lines.push("## Incident Evidence");
  lines.push("");
  lines.push(`**Timestamp:** ${evidence.timestamp}`);
  lines.push("");

  if (evidence.serviceName) {
    lines.push("### Service");
    lines.push(`- **Name:** ${evidence.serviceName}`);
    lines.push("");
  }

  if (evidence.errorContext && Object.keys(evidence.errorContext).length > 0) {
    lines.push("### Error Context");
    for (const [key, value] of Object.entries(evidence.errorContext)) {
      lines.push(`- **${key}:** ${value}`);
    }
    lines.push("");
  }

  if (evidence.gitContext) {
    lines.push("### Git Context");
    lines.push(`- **Commit:** \`${evidence.gitContext.commit}\``);
    lines.push(`- **Branch:** ${evidence.gitContext.branch}`);
    lines.push(`- **Uncommitted changes:** ${evidence.gitContext.hasUncommitted ? "Yes" : "No"}`);
    lines.push("");
  }

  if (evidence.systemInfo) {
    lines.push("### System Info");
    lines.push(`- **Hostname:** ${evidence.systemInfo.hostname}`);
    lines.push(`- **Uptime:** ${evidence.systemInfo.uptime}`);
    lines.push(`- **Memory available:** ${evidence.systemInfo.memFree}`);
    lines.push("");
  }

  if (evidence.stateFile) {
    lines.push("### State File");
    lines.push(`- **Size:** ${evidence.stateFile.size}`);
    lines.push(`- **Last modified:** ${evidence.stateFile.modified}`);
    lines.push("");
  }

  if (evidence.providerHealth && Object.keys(evidence.providerHealth).length > 0) {
    lines.push("### Provider Health");
    lines.push("");
    for (const [provider, health] of Object.entries(evidence.providerHealth)) {
      lines.push(`**${provider}:**`);
      lines.push(`- State: ${health.state}`);
      lines.push(`- Consecutive failures: ${health.consecutiveFailures || 0}`);
      lines.push(`- Consecutive successes: ${health.consecutiveSuccesses || 0}`);
      if (health.lastErrorType) {
        lines.push(`- Last error: ${health.lastErrorType}`);
      }
      lines.push("");
    }
  }

  if (evidence.journalLog) {
    lines.push("### Service Journal (last 100 lines)");
    lines.push("");
    lines.push("```");
    lines.push(evidence.journalLog.trim());
    lines.push("```");
    lines.push("");
  }

  return lines.join("\n");
}
