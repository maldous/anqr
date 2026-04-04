// Generated from ../scripts/agent-docs-check.mjs:49

import { errors } from "./errors.mjs";

export function parseMarkdownTable(content, label) {
  const agents = new Set();
  const re = /^\|\s*`([a-z][a-z0-9-]*)`(?:\s*\/\s*`([a-z][a-z0-9-]*)`)?/gm;
  let match;
  while ((match = re.exec(content)) !== null) {
    agents.add(match[1]);
    if (match[2]) agents.add(match[2]);
  }
  if (agents.size === 0) {
    errors.push(`${label}: could not parse any agent names from table`);
  }
  return agents;
}
