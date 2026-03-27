#!/usr/bin/env node

/**
 * update-stuck-issues-with-missing-tools.mjs — Update ANQ-1052 and ANQ-1053 with missing tools understanding
 */

import { addComment } from "./linear-client.mjs";

const MISSING_TOOLS_ANALYSIS = `## Update: Missing Tools Root Cause Analysis (2026-03-27)

After documenting all tools across Symphony bridge, Codebuff bridge, OpenClaw, and Symphony runner (see \`docs/harness/provider-tools-inventory.md\`), I've identified a critical issue that explains why agents appear "stuck":

### Root Cause: Missing Critical Tools

**The Symphony bridge only exposes 6 tools:**
1. \`exec\` - Execute commands
2. \`read\` - Read files
3. \`write\` - Write files
4. \`glob\` - Find files by pattern
5. \`memory_search\` - Search memory files
6. \`memory_get\` - Get memory files

**Missing tools that agents expect (from type definitions in \`.agents/types/tools.types.ts\`):**

#### Priority 1: Critical Missing Tools
1. **\`run_file_change_hooks\`** - Execute file change hooks after writes
   - **Impact**: Agents cannot verify their changes (no typecheck, lint, tests)
   - **Result**: Agents write files, then wait for validation that never comes
   - **Detection**: Appears as "3 consecutive turns without tool calls" because agent is waiting for hook results

2. **\`think_deeply\`** - Deep reasoning for complex tasks
   - **Impact**: Agents cannot signal they're in planning/reasoning phase
   - **Result**: Planning turns counted as "no tool calls" and flagged as stuck
   - **Detection**: Legitimate planning phases trigger false stuck detection

3. **\`update_subgoal\` / \`add_subgoal\`** - Task progress tracking
   - **Impact**: Agents cannot report progress on multi-step tasks
   - **Result**: Symphony runner has no visibility into agent progress
   - **Detection**: Runner thinks agent is stuck when it's actually progressing through subgoals

#### Priority 2: Nice-to-Have Missing Tools
- \`find_files\` - Natural language file search (could wrap file-explorer agent)
- \`web_search\` - Web search capability
- \`read_docs\` - Library documentation via Context7

### How This Causes "Stuck" False Positives

**Scenario 1: Post-Write Validation Loop**
\`\`\`
Turn 1: Agent reads files (uses read tool)
Turn 2: Agent writes changes (uses write tool)
Turn 3: Agent expects run_file_change_hooks to return results
        → Tool doesn't exist, so agent gets no response
        → Agent sends empty turn waiting for validation
Turn 4: Agent still waiting for validation results
        → Empty turn #2
Turn 5: Agent gives up or tries to continue
        → Empty turn #3
        → STUCK DETECTION TRIGGERS (FALSE POSITIVE)
\`\`\`

**Scenario 2: Planning Phase**
\`\`\`
Turn 1: Agent reads codebase to understand context (uses read tool)
Turn 2: Agent analyzes approach (would use think_deeply, but it's missing)
        → Sends planning content without tool calls
        → Counted as "no tool calls"
Turn 3: Agent refines plan (would use update_subgoal, but it's missing)
        → Planning content without tool calls
        → Counted as "no tool calls" #2
Turn 4: Agent starts implementation (finally uses write tool)
        → But already at 2/3 strikes
Turn 5: Agent writes another file (uses write tool)
Turn 6: Agent expects validation (run_file_change_hooks missing)
        → Empty turn = strike #3
        → STUCK DETECTION TRIGGERS (FALSE POSITIVE)
\`\`\`

### Relationship to ANQ-1055 and ANQ-1056

- **ANQ-1055**: Implement \`think_deeply\` tool (addresses Scenario 2)
- **ANQ-1056**: Implement missing tools comprehensively (addresses both scenarios)

**These issues are BLOCKERS for this issue** because fixing the stuck detection logic won't help if agents genuinely can't signal their progress or get validation results.

### Recommended Fix Order

1. **First**: Implement ANQ-1055 and ANQ-1056 (add missing tools)
2. **Then**: Revisit this issue to see if stuck detection still has false positives
3. **Finally**: Tune stuck detection threshold or heuristics if needed

### Evidence

- Tool inventory: \`docs/harness/provider-tools-inventory.md\`
- Missing tools issue: ANQ-1056
- Think deeply issue: ANQ-1055
- Symphony bridge tools implementation: \`scripts/ops/integrations/model/symphony-openai-bridge.mjs:664-715\`
- Type definitions showing expected tools: \`.agents/types/tools.types.ts\`

### Revised Hypothesis

**The "stuck" detection is working correctly.** Agents ARE getting stuck because they're waiting for tools that don't exist. This is not a detection bug; it's a **missing tools bug**.

The real issue title should be: "Agents stuck waiting for missing tools (\`run_file_change_hooks\`, \`think_deeply\`, \`update_subgoal\`)"

---

**Recommendation**: Mark this issue as BLOCKED by ANQ-1055 and ANQ-1056, or convert it to a meta-issue tracking the missing tools implementation.`;

async function updateIssue(identifier, issueTitle) {
  console.log(`\nUpdating ${identifier}: ${issueTitle}...`);
  
  try {
    // Get issue details to find the issue ID (Linear uses UUID, not identifier)
    const issues = await import("./linear-client.mjs").then((m) =>
      m.findOpenIssuesByDescriptionFragment("Stuck: 3 consecutive turns without tool calls"),
    );
    
    const issue = issues.find((i) => i.identifier === identifier);
    if (!issue) {
      console.error(`   ❌ Issue ${identifier} not found`);
      return false;
    }
    
    // Add comment with analysis
    await addComment(issue.id, MISSING_TOOLS_ANALYSIS);
    console.log(`   ✅ Added missing tools analysis comment`);
    console.log(`   URL: https://linear.app/anqr/issue/${identifier}`);
    return true;
  } catch (err) {
    console.error(`   ❌ Failed to update ${identifier}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log("Updating ANQ-1052 and ANQ-1053 with missing tools understanding...\n");
  
  const results = await Promise.all([
    updateIssue("ANQ-1052", "Fix improper issue closure with 'Stuck: 3 consecutive turns without tool calls' error"),
    updateIssue("ANQ-1053", "Fix improper issue closure with 'Stuck: 3 consecutive turns without tool calls' error"),
  ]);
  
  const successCount = results.filter(Boolean).length;
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Updated ${successCount}/2 issues`);
  console.log(`${"=".repeat(60)}\n`);
  
  if (successCount !== 2) {
    process.exit(1);
  }
}

await main();
