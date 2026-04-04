import { errors } from "./errors.mjs";

export function parseKnownAgentTypes(content) {
  const agents = new Set();
  const blockMatch = content.match(/export type KnownAgentType\s*=[^;]+;/s);
  if (!blockMatch) {
    errors.push("tools.types.ts: could not find KnownAgentType union");
    return agents;
  }
  const block = blockMatch[0];
  const re = /\|\s*"([a-z][a-z0-9-]*)"/g;
  let match;
  while ((match = re.exec(block)) !== null) {
    agents.add(match[1]);
  }
  return agents;
}
