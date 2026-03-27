#!/usr/bin/env node

/**
 * create-think-deeply-issue.mjs — Create Linear issue for think_deeply tool implementation
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Implement think_deeply tool in Symphony and Codebuff bridges",
  description: `## Problem

The \`think_deeply\` tool is defined in \`.agents/types/tools.types.ts\` and listed in OpenClaw configuration (\`.openclaw/openclaw.json\` and \`.openclaw/models.json\`), but it's not actually implemented in the bridge code.

**Error message**: \`Tool think_deeply is not currently available. Make sure to only use tools provided at the start of the conversation AND that you most recently have permission to use.\`

## Root Cause

Neither \`symphony-openai-bridge.mjs\` nor \`codebuff-openai-bridge.mjs\` include \`think_deeply\` in their \`tools\` object. The Symphony bridge only implements:
- exec, read, write, glob, memory_search, memory_get

## Solution

Add \`think_deeply\` tool implementation to both bridges using the AI SDK \`tool()\` function:

\`\`\`javascript
think_deeply: tool({
  description: 'Deeply consider complex tasks by brainstorming approaches and tradeoffs step-by-step',
  inputSchema: z.object({
    thought: z.string().describe('Detailed step-by-step analysis. Initially keep each step concise (max ~5-7 words per step).')
  }),
  execute: async ({ thought }) => {
    // Log the thinking for observability
    logInfo(\`💭 Deep thinking: \${thought.slice(0, 200)}\`);
    // Return acknowledgment
    return { acknowledged: true, thought };
  }
})
\`\`\`

## Acceptance Criteria

- [ ] \`think_deeply\` tool added to \`tools\` object in \`symphony-openai-bridge.mjs\`
- [ ] \`think_deeply\` tool added to \`tools\` object in \`codebuff-openai-bridge.mjs\` (if applicable)
- [ ] Tool executes successfully when called by AI models
- [ ] No error message about tool not being available
- [ ] Tool output logged for observability`,
  stateId: STATES.backlog,
  labelIds: [LABELS.bug],
  priority: 2, // P1
  estimate: 3,
};

async function main() {
  try {
    const issue = await createIssue(issueInput);
    console.log(`✅ Created issue: ${issue.identifier} — ${issue.title}`);
    console.log(`   URL: https://linear.app/anqr/issue/${issue.identifier}`);
    console.log(`   State: ${issue.state.name}`);
    console.log(`   Priority: P${issue.priority}`);
    console.log(`   Estimate: ${issue.estimate} points`);
  } catch (err) {
    console.error("❌ Failed to create issue:", err.message);
    process.exit(1);
  }
}

main();
