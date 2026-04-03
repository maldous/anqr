import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createLogger } from "./ops/lib/logger.mjs";

const { logInfo, logError } = createLogger();
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function resolve(rel) {
  return path.join(repoRoot, rel);
}

async function read(rel) {
  try {
    return await readFile(resolve(rel), "utf8");
  } catch {
    errors.push(`${rel}: file not found`);
    return "";
  }
}

/**
 * Extract agent names from KnownAgentType union in tools.types.ts.
 * Scopes to the KnownAgentType block to avoid picking up ToolName entries.
 */
function parseKnownAgentTypes(content) {
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

/**
 * Extract agent names from markdown tables.
 * Matches first column backtick-quoted agent names like: | `basher` |
 * Also handles combined rows like: | `thinker` / `thinker-gpt` |
 */
function parseMarkdownTable(content, label) {
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

function sorted(set) {
  return [...set].sort();
}

function compareSets(source, sourceLabel, target, targetLabel) {
  for (const agent of source) {
    if (!target.has(agent)) {
      errors.push(`${targetLabel}: missing \`${agent}\` (present in ${sourceLabel})`);
    }
  }
  for (const agent of target) {
    if (!source.has(agent)) {
      errors.push(`${targetLabel}: has extra \`${agent}\` (not in ${sourceLabel})`);
    }
  }
}

async function main() {
  const typesContent = await read(".agents/types/tools.types.ts");
  const guideContent = await read(".agents/SPAWN_AGENTS_GUIDE.md");
  const agentsContent = await read("AGENTS.md");

  if (errors.length > 0) {
    logError("agent-docs-check: missing required files");
    for (const error of errors) logError(`  ✗ ${error}`);
    process.exitCode = 1;
    return;
  }

  // 1. Parse agent lists from each source
  const typesAgents = parseKnownAgentTypes(typesContent);
  const guideAgents = parseMarkdownTable(guideContent, "SPAWN_AGENTS_GUIDE.md");

  // AGENTS.md table is inside the "Agent spawning" section — extract just that section
  const agentSpawningMatch = agentsContent.match(
    /\*\*Agent types and required params[^]*?\*\*basher examples:/,
  );
  const agentsTableAgents = agentSpawningMatch
    ? parseMarkdownTable(agentSpawningMatch[0], "AGENTS.md")
    : new Set();
  if (!agentSpawningMatch) {
    errors.push("AGENTS.md: could not find agent types table section");
  }

  // 2. Compare: tools.types.ts is the source of truth
  const sourceLabel = "tools.types.ts (KnownAgentType)";

  logInfo(`  tools.types.ts agents:        ${sorted(typesAgents).join(", ")}`);
  logInfo(`  SPAWN_AGENTS_GUIDE.md agents: ${sorted(guideAgents).join(", ")}`);
  logInfo(`  AGENTS.md agents:             ${sorted(agentsTableAgents).join(", ")}`);

  compareSets(typesAgents, sourceLabel, guideAgents, "SPAWN_AGENTS_GUIDE.md");
  compareSets(typesAgents, sourceLabel, agentsTableAgents, "AGENTS.md");

  // 3. Check basher params.command is documented as required in each file
  if (!typesContent.includes("command: string")) {
    errors.push("tools.types.ts: BasherParams.command should be typed as required string");
  }
  if (!guideContent.includes("params.command")) {
    errors.push("SPAWN_AGENTS_GUIDE.md: missing basher params.command requirement");
  }
  if (!agentsContent.includes("params.command")) {
    errors.push("AGENTS.md: missing basher params.command requirement");
  }

  // 4. Check for stale agent names
  const staleNames = ["code-reviewer-lite", "code_reviewer_lite"];
  const allContent = typesContent + guideContent + agentsContent;
  for (const stale of staleNames) {
    if (allContent.includes(stale)) {
      errors.push(`Found stale agent name: ${stale}`);
    }
  }

  // Report
  if (errors.length > 0) {
    logError("agent-docs-check failed:");
    for (const error of errors) logError(`  ✗ ${error}`);
    process.exitCode = 1;
    return;
  }

  logInfo(
    `agent-docs-check: all ${typesAgents.size} agent types consistent across 3 documentation files`,
  );
}

await main();
