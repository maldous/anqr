import process from "node:process";

import { compareSets } from "./compare-sets.mjs";
import { errors } from "./errors.mjs";
import { parseKnownAgentTypes } from "./parse-known-agent-types.mjs";
import { parseMarkdownTable } from "./parse-markdown-table.mjs";
import { read } from "./read.mjs";
import { sorted } from "./sorted.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function main() {
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
