# ANQ-1093: Symphony Runner Infinite Loop Resolution

## Problem Identified

The Symphony runner was stuck in an infinite loop on issue ANQ-1092, repeating the same work multiple times without moving to the next issue.

### Root Cause

When the Codebuff/Symphony agent determined that work was already completed (e.g., by detecting `task_complete.md` exists), it would respond with text like "The task has already been completed successfully" **without calling the `task_complete` tool**.

The agent logic treated these streaming text responses as "legitimate work" and would prompt the agent to continue, creating an infinite loop:

1. Agent: "The task has already been completed successfully"
2. Runner sees no tool calls, but treats it as legitimate work
3. Runner prompts: "Continue implementing the changes..."
4. Agent: "The task has already been completed successfully" (repeat)

### Evidence from Logs

```
09:21:34 - ANQ-1092 completed (521 chars)
09:21:54 - ANQ-1092 **again** (193 chars) 
09:22:10 - ANQ-1092 **again** (521 chars)
09:22:29 - ANQ-1092 **again** (521 chars)
09:22:50 - ANQ-1092 **again** (same)
```

The runner reached Turn 49/600 before intervention.

## Solution Implemented

### 1. Agent-Level Detection (`symphony-agent.mjs`)

Added early detection in the tool-calling loop to identify when the agent is reporting work is already done:

```javascript
// Detect if agent is saying work is already done (external completion)
const isReportingDone = 
  (/task.{0,20}(has been|was|is).{0,20}(already.{0,20})?(completed|done|finished|resolved)/i.test(content) ||
   /already.{0,20}(completed|done|finished|resolved)/i.test(content) ||
   /(no changes|nothing to do|work is done)/i.test(content)) &&
  filesChanged.size === 0;

if (isReportingDone) {
  logInfo("[agent] Agent reports work already completed - treating as external completion");
  return {
    completed: false,
    summary: `Work already completed externally: ${snippet}`,
    externallyCompleted: true, // Signal to runner
    // ... other fields
  };
}
```

This check runs **before** the `isLegitimateWork` check, so even Symphony/Codebuff bridge responses claiming completion are caught early.

### 2. Runner-Level Handling (`symphony-runner.mjs`)

Updated the runner to recognize the `externallyCompleted` flag and mark the issue as Done:

```javascript
const isExternallyCompleted =
  agentResult.externallyCompleted === true ||
  detail?.state?.name === "Done" ||
  detail?.state?.name === "Canceled" ||
  (summary.includes("already") && summary.includes("completed")) ||
  summary.includes("completed externally") ||
  summary.includes("work already completed");

if (isExternallyCompleted) {
  await updateIssue(issue.id, { stateId: STATES.done });
  await addComment(issue.id, "✅ **Completed externally** — no file changes detected...");
  // Track as successful completion
  recordLinearCompletion(metricsProviderName, { completed: true, ... });
  recordProviderSuccess(metricsProviderName);
}
```

## Testing

- ✅ Typecheck: passed
- ✅ Pattern detection: Regex tested against actual log output
- ✅ Provider checks preserved: Symphony/Codebuff bridges still treated as legitimate work (unless reporting done)

## Impact

This fix prevents the infinite loop while:
1. Preserving normal streaming behavior for Symphony/Codebuff bridges
2. Properly detecting external/human completion
3. Allowing the runner to move on to the next issue
4. Tracking the completion metrics correctly

## Related Issues

- ANQ-1092: The stuck issue that triggered this discovery
- Harness operating model: Ensures efficient queue processing
