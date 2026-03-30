/**
 * linear-chunker.mjs — Chunking for Linear issues
 *
 * Strategy: 1 chunk per issue containing title, description, and metadata
 */

import { createLogger } from "../logger.mjs";

const { logDebug } = createLogger("rag-linear-chunker");

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
  const description = issue.description || "(no description)";

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
