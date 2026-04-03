/**
 * linear-chunker.mjs — Chunking for Linear issues
 *
 * Strategy: 1 chunk per issue containing title, description, and metadata
 */

import { createLogger } from "../logger.mjs";

const { logDebug } = createLogger("rag-linear-chunker");
const MAX_DESCRIPTION_CHARS = Number(process.env.LINEAR_RAG_MAX_DESCRIPTION_CHARS || 1800);

function compactWhitespace(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function truncateDescription(description) {
  const compacted = compactWhitespace(description);
  if (compacted.length <= MAX_DESCRIPTION_CHARS) return compacted;
  return `${compacted.slice(0, MAX_DESCRIPTION_CHARS).trim()}\n\n[truncated for embedding efficiency]`;
}

/**
 * Convert a Linear issue to a RAG chunk
 * @param {Object} issue - Linear issue object
 * @returns {Array<Object>} Array with single chunk
 */
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

/**
 * Chunk multiple Linear issues
 * @param {Array<Object>} issues - Array of Linear issue objects
 * @returns {Array<Object>} Array of chunks
 */
export function chunkLinearIssues(issues) {
  if (!Array.isArray(issues)) {
    return [];
  }

  const chunks = [];
  for (const issue of issues) {
    chunks.push(...chunkLinearIssue(issue));
  }

  return chunks;
}
