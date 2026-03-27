#!/usr/bin/env node

/**
 * create-stuck-issue-close-bug.mjs — Create Linear issue for improper issue closure bug
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Fix improper issue closure with 'Stuck: 3 consecutive turns without tool calls' error",
  description: `## Summary

Fix the issue detection logic that incorrectly closes Linear issues with "Stuck: 3 consecutive turns without tool calls" when the agent is actually working properly.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- Harness: Symphony runner execution logic
- Harness: Issue state management and closure detection
- Harness: Tool call detection and continuation logic

## Constraints

- **Architecture**: Must preserve existing tool-calling loop and validation logic
- **Launch-claim**: Harness only (not product runtime)
- **Quality**: Critical reliability issue affecting multiple Linear issues

## Problem Statement

Many Linear issues are being closed with the status "Stuck: 3 consecutive turns without tool calls" even when the agent appears to be working correctly. This suggests the detection logic is either:

1. **Too strict**: Counting turns that shouldn't count as "no tool calls"
2. **Missing context**: Not recognizing autonomous agent patterns (Codebuff SDK, Symphony bridge)
3. **Incorrect continuation detection**: Failing to detect when agents signal they need more time
4. **Timing issues**: Racing with async operations or streaming responses

## Current Implementation

Location: \`scripts/ops/runtime/symphony/symphony-agent.mjs\` line 825

\`\`\`javascript
if (!msg.tool_calls || msg.tool_calls.length === 0) {
  consecutiveNoToolCalls++;
  if (consecutiveNoToolCalls >= 3) {
    logWarn("[agent] Too many consecutive turns without tool calls — aborting");
    const snippet = msg.content?.slice(0, 150).replaceAll("\\n", " ") || "(empty)";
    return {
      completed: false,
      summary: \`Stuck: \${consecutiveNoToolCalls} consecutive turns without tool calls. Last: \${snippet}\`,
      // ... rest of return object
    };
  }
  // ... continuation logic
}
\`\`\`

## Investigation Areas

### 1. Autonomous Agent Patterns (Codebuff/Symphony)

The code already has special handling for \`provider.requiresSdk\` (Codebuff) agents that complete in one run without tool calls. However:

- Are there cases where Codebuff is triggered but doesn't set \`requiresSdk\`?
- Does the Symphony bridge streaming path (lines 593-688) properly reset \`consecutiveNoToolCalls\`?
- Should streaming responses be treated differently?

### 2. Message Content vs Tool Calls

The logic continues with a user prompt after no tool calls (lines 905-912):

\`\`\`javascript
messages.push({
  role: "user",
  content: "Continue implementing the changes. Use the available tools..."
});
continue;
\`\`\`

This means the agent gets 3 chances to use tools. Is this too few for:
- Planning phases?
- Reading/understanding large codebases?
- Complex multi-step tasks?

### 3. Subgoal Detection vs Completion

Lines 857-922 handle subgoal metadata parsing. The code checks for active subgoals and sets \`needsContinuation\`:

\`\`\`javascript
if (hasActiveSubgoals) {
  return {
    completed: false,
    needsContinuation: true,
    // ...
  };
}
\`\`\`

But this only applies to \`provider.requiresSdk\` agents. Should this pattern extend to all agents?

### 4. Turn Budget Warning Timing

Lines 1029-1038 inject a turn budget warning at \`RUNNER_TURN_BUDGET_WARNING\` turns remaining. Does this warning come too late if the agent has already been marked as stuck?

## Potential Root Causes

### Hypothesis 1: Streaming Responses Not Resetting Counter
Symphony bridge uses streaming (lines 593-688) and may not properly populate \`tool_calls\` array, causing false "no tool calls" detection.

### Hypothesis 2: Legitimate Planning Phases
Some tasks require the agent to:
1. Read files and understand context (turn 1 - no tools, just thinking)
2. Ask clarifying questions or plan (turn 2 - no tools, just content)
3. Start implementing (turn 3 - tools finally called)

Current 3-turn limit doesn't accommodate this pattern.

### Hypothesis 3: Continuation Detection Incomplete
\`needsContinuation\` flag exists but may not be checked by the caller (symphony-runner.mjs). If the runner doesn't respect this flag, it prematurely closes issues.

### Hypothesis 4: Response Format Mismatch
Different providers return different response structures. The code expects \`response.choices?.[0]?.message?.tool_calls\` but some providers might:
- Omit the \`tool_calls\` array entirely (vs empty array)
- Use different field names
- Return \`null\` vs \`undefined\` vs \`[]\`

## Proposed Solutions

### Option 1: Increase Stuck Threshold (Conservative)
Change threshold from 3 to 5-7 consecutive turns without tool calls.

**Pros**: Simple, low risk
**Cons**: Doesn't fix root cause, may just delay the problem

### Option 2: Smarter Stuck Detection (Recommended)
Replace simple counter with heuristics:

\`\`\`javascript
// Don't count as "stuck" if:
// - Message content shows planning/thinking (contains keywords)
// - Message is asking for clarification
// - Response indicates reading/understanding phase
// - Subgoals are being managed (even without SDK flag)
// - Streaming response was received

function isLegitimateNonToolTurn(msg, provider, response) {
  const content = msg.content || "";
  
  // Streaming responses are active work
  if (response.streamedContent) return true;
  
  // Subgoal management is active work
  if (content.includes("Subgoal") || content.includes("subgoal")) return true;
  
  // Planning phrases
  const planningPhrases = [
    "let me understand", "first, i need to", "let me read",
    "i'll start by", "here's my plan", "steps:", "approach:"
  ];
  if (planningPhrases.some(p => content.toLowerCase().includes(p))) return true;
  
  // Continuation signal
  if (response.needsContinuation) return true;
  
  return false;
}
\`\`\`

### Option 3: Explicit Continuation Protocol
Add a "thinking" or "planning" tool that agents can call to signal they're actively working:

\`\`\`javascript
{
  type: "function",
  function: {
    name: "continue_thinking",
    description: "Signal that you need more time to plan or understand before taking action",
    parameters: {
      type: "object",
      properties: {
        reason: { type: "string", description: "Why you need more time" }
      }
    }
  }
}
\`\`\`

### Option 4: Session-Based Detection
Track total session progress instead of consecutive turns:
- Has the agent made ANY file changes?
- Has the agent run ANY validation tools?
- Is git working tree dirty (changes made)?

Only mark as stuck if: no progress indicators AND 3+ consecutive no-tool turns.

## Definition Of Done

- [ ] Root cause identified through code review and logs
- [ ] Solution implemented (one or more options above)
- [ ] Existing tests pass
- [ ] New tests added covering edge cases
- [ ] No regression in legitimate stuck detection (agents actually looping)
- [ ] Historical stuck issues reviewed - would fix prevent false positives?
- [ ] Documentation updated in symphony-agent.mjs

## Verification

\`\`\`bash
# Type checking
npm run typecheck:all

# Unit tests
npm run test:unit

# Integration tests (if available)
npx vitest run tests/integration/

# Manual validation:
# 1. Review recent Linear issues marked as "Stuck: X consecutive turns"
# 2. Check their message history - were they actually stuck or working?
# 3. Run Symphony runner on a known-good issue and verify no false stuck detection
# 4. Run Symphony runner on a known-bad issue (infinite loop) and verify it still detects stuck
\`\`\`

## Evidence Payload

- Summary of root cause analysis
- Solution approach selected
- Code changes in \`symphony-agent.mjs\` and related files
- Test coverage additions
- Before/after analysis of stuck detection accuracy
- Review of historical false positives
- Commands run with pass/fail results
- Commit hash
- Risk assessment

## Escalate If

- Fix requires changes to Linear issue state model
- Breaking change to existing agent contracts
- Performance impact exceeds 100ms per turn
- Requires modification of provider response schemas`,
  stateId: STATES.backlog,
  labelIds: [LABELS.harness, LABELS.bug],
  priority: 1, // High priority - affecting multiple issues
  estimate: 5, // Medium-high complexity (investigation + fix)
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

await main();
