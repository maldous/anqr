#!/usr/bin/env node

/**
 * create-missing-tools-issue.mjs — Create Linear issue for missing tool implementations
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Implement missing tools in Symphony and Codebuff bridges for OpenClaw compatibility",
  description: `## Problem

Three tools are defined in Codebuff's type system (.agents/types/tools.types.ts) but are NOT implemented as executable tools in the Symphony and Codebuff bridges:

1. **run_file_change_hooks** - Executes file change hooks when files are modified
2. **think_deeply** - Enables deep reasoning about complex tasks
3. **update_subgoal** / **add_subgoal** - Manages subgoals for multi-step tasks

**Impact**: When OpenClaw or other clients try to use these tools through the bridges, they get "tool not found" errors because the bridges don't expose them as executable tools.

## Root Cause

### Codebuff Bridge (\`codebuff-openai-bridge.mjs\`)
- These tools are handled internally by the Codebuff SDK
- The bridge has display formatting for them in \`formatToolCallDisplay()\` (lines 490-520)
- They track subgoal state changes (lines 547, 702-711, 1008-1014)
- **BUT**: They are NOT exposed in any \`tools\` object for external clients to call

### Symphony Bridge (\`symphony-openai-bridge.mjs\`)
- Only exposes 6 tools: \`exec\`, \`read\`, \`write\`, \`glob\`, \`memory_search\`, \`memory_get\`
- Does NOT include \`run_file_change_hooks\`, \`think_deeply\`, \`update_subgoal\`, or \`add_subgoal\`
- These tools are expected by OpenClaw clients but fail at runtime

## Solution

### Option 1: Proxy to Codebuff SDK (Recommended for SDK-managed tools)
For tools that are internal to Codebuff's execution model (\`update_subgoal\`, \`add_subgoal\`), these should remain SDK-internal and NOT be exposed externally. They are managed by the Codebuff agent runtime.

### Option 2: Implement as Bridge Tools (For missing tools)
Implement \`run_file_change_hooks\` and \`think_deeply\` as actual AI SDK tools in both bridges:

**Symphony Bridge** (\`symphony-openai-bridge.mjs\`):

\`\`\`javascript
import { z } from "zod";
import { tool } from "ai";

const tools = {
  // ... existing tools (exec, read, write, glob, memory_search, memory_get)
  
  run_file_change_hooks: tool({
    description: "Execute file change hooks for modified files",
    inputSchema: z.object({
      files: z.array(z.string()).describe("List of file paths that were changed"),
    }),
    execute: async ({ files }) => {
      // Execute configured file change hooks from codebuff.json
      const hooks = process.env.FILE_CHANGE_HOOKS || "";
      if (!hooks) {
        return { success: true, message: "No file change hooks configured" };
      }
      
      try {
        const command = hooks.replace("{files}", files.join(" "));
        const result = execSync(command, { 
          encoding: "utf-8",
          timeout: 60000,
        });
        return { success: true, output: result };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
  }),
  
  think_deeply: tool({
    description: "Deeply consider complex tasks by brainstorming approaches and tradeoffs step-by-step",
    inputSchema: z.object({
      thought: z.string().describe("Detailed step-by-step analysis"),
    }),
    execute: async ({ thought }) => {
      // Log the thinking for observability
      logInfo(\`💭 Deep thinking: \${thought.slice(0, 200)}\`);
      return { acknowledged: true, thought };
    },
  }),
};
\`\`\`

**Codebuff Bridge** (\`codebuff-openai-bridge.mjs\`):
- Does NOT need to implement these tools
- Codebuff SDK handles them internally via its own tool execution model
- The bridge already tracks their usage for display purposes (lines 490-520)

### Option 3: OpenClaw Tool Proxy (For distributed systems)
If these tools need to be available to OpenClaw clients through the Symphony bridge, implement tool proxying similar to the existing OpenClaw Gateway integration (lines 75-160 in codebuff-bridge):

\`\`\`javascript
// In symphony-openai-bridge.mjs, add to tools object:
run_file_change_hooks: tool({
  description: "Execute file change hooks for modified files",
  inputSchema: z.object({
    files: z.array(z.string()).describe("List of file paths"),
  }),
  execute: async ({ files }) => {
    // Proxy to OpenClaw Gateway if session ID present
    if (currentSessionId && OPENCLAW_TOOL_PROXY_ENABLED) {
      return await callOpenClawGatewayTool("run_file_change_hooks", { files }, currentSessionId);
    }
    // Otherwise execute locally
    return await executeFileChangeHooksLocally(files);
  },
}),
\`\`\`

## Investigation Questions

1. **Are these tools meant to be called by external clients, or are they SDK-internal?**
   - \`update_subgoal\` / \`add_subgoal\`: Likely SDK-internal (used by Codebuff agent runtime)
   - \`think_deeply\`: Could be either (useful for explicit reasoning steps)
   - \`run_file_change_hooks\`: Should be bridge-level (executes after file writes)

2. **Where should \`run_file_change_hooks\` execute?**
   - In the bridge (local execution)?
   - In OpenClaw Gateway (distributed execution)?
   - In the Codebuff SDK (agent-managed)?

3. **Should \`think_deeply\` be a no-op acknowledgment or actually trigger special processing?**

## Acceptance Criteria

- [ ] Investigate which tools should be bridge-exposed vs SDK-internal
- [ ] Implement \`run_file_change_hooks\` in Symphony bridge (if needed)
- [ ] Implement \`think_deeply\` in Symphony bridge (if needed)
- [ ] Document which tools are SDK-internal and should NOT be called externally
- [ ] Update OpenClaw configuration to reflect actually-available tools
- [ ] Test that OpenClaw clients can call the implemented tools successfully
- [ ] Verify that SDK-internal tools (\`update_subgoal\`, \`add_subgoal\`) continue to work within Codebuff agent execution

## References

- Tool type definitions: \`.agents/types/tools.types.ts\`
- Codebuff bridge tool display: \`codebuff-openai-bridge.mjs:490-520\`
- Symphony bridge tools: \`symphony-openai-bridge.mjs:450-550\` (approx)
- OpenClaw tool proxy pattern: \`codebuff-openai-bridge.mjs:75-160\`
- Existing create-think-deeply-issue.mjs: \`scripts/ops/integrations/linear/create-think-deeply-issue.mjs\``,
  stateId: STATES.backlog,
  labelIds: [LABELS.bug],
  priority: 1, // P0 - blocking OpenClaw integration
  estimate: 5,
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
