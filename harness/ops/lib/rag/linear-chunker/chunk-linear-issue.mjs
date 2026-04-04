import { truncateDescription } from "./truncate-description.mjs";
import { asCommaList } from "./as-comma-list.mjs";
import { countLines } from "./count-lines.mjs";
import { logDebug } from "./logger.mjs";

export function chunkLinearIssue(issue) {
  if (!issue || !issue.identifier || !issue.title) {
    logDebug(`Skipping invalid issue: ${JSON.stringify(issue)}`);
    return [];
  }

  const labels = Array.isArray(issue.labels?.nodes)
    ? issue.labels.nodes.map((label) => label?.name).filter(Boolean)
    : [];

  const priority = issue.priority || "None";
  const state = issue.state?.name || "Unknown";
  const team = issue.team?.name || "Unknown";
  const project = issue.project?.name || "None";
  const assignee = issue.assignee?.name || issue.assignee?.displayName || "Unassigned";
  const creator = issue.creator?.name || issue.creator?.displayName || "Unknown";
  const url = issue.url || issue.identifier;
  const description = truncateDescription(issue.description || "(no description)");

  const content = `
# ${issue.identifier}: ${issue.title}

**Priority:** ${priority}
**State:** ${state}
**Team:** ${team}
**Project:** ${project}
**Assignee:** ${assignee}
**Creator:** ${creator}
**Labels:** ${asCommaList(labels)}
**Updated:** ${issue.updatedAt || "Unknown"}
**Created:** ${issue.createdAt || "Unknown"}
**URL:** ${url}

## Description

${description}
`.trim();

  const chunk = {
    id: `linear-${issue.identifier}`,
    filePath: `linear://${issue.identifier}`,
    content,
    startLine: 1,
    endLine: countLines(content),
    type: "issue",
    metadata: {
      identifier: issue.identifier,
      title: issue.title,
      state,
      priority,
      team,
      project,
      assignee,
      creator,
      labels,
      updatedAt: issue.updatedAt,
      createdAt: issue.createdAt,
      url: issue.url || null,
    },
  };

  logDebug(`Chunked ${issue.identifier}: ${content.length} chars`);
  return [chunk];
}
