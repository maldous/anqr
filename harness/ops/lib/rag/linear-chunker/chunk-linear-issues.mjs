// Generated from ../../../../scripts/ops/lib/rag/linear-chunker.mjs:80

import { chunkLinearIssue } from "./chunk-linear-issue.mjs";

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
