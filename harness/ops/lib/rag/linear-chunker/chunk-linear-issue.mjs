import { truncateDescription } from "./truncate-description.mjs";
import { logDebug } from "./logger.mjs";

export function chunkLinearIssue(issue) {
  if (!issue || !issue.identifier || !issue.title) {
    logDebug(`Skipping invalid issue: ${JSON.stringify(issue)}`);
    return [];
  }

  const labels = Array.isArray(issue.labels?.nodes)
    ? issue.labels.nodes.map((l) => l.name).join(", ")
    : "";

  const priority = issue.priority || "None";
  const state = issue.state?.name || "Unknown";
  const description = truncateDescription(issue.description || "(no description)");

  const content = `
# ${issue.identifier}: ${issue.title}

**Priority:** ${priority}
**State:** ${state}
**Labels:** ${labels || "None"}

## Description

${description}
`.trim();

  const chunk = {
    id: `linear-${issue.identifier}`,
    filePath: `linear://${issue.identifier}`,
    content,
    startLine: 1,
    endLine: 1,
    type: "issue",
    metadata: {
      identifier: issue.identifier,
      state,
      priority,
      updatedAt: issue.updatedAt,
    },
  };

  logDebug(`Chunked ${issue.identifier}: ${content.length} chars`);
  return [chunk];
}
