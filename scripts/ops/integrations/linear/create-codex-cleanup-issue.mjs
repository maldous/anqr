#!/usr/bin/env node

/**
 * create-codex-cleanup-issue.mjs — Create Linear issue for codex process cleanup
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issue = await createIssue({
  title: "Codex process cleanup fails when credits run out - multiple processes chew CPU",
  description: `## Summary

Codex SDK processes are not cleaned up gracefully when credits run out, resulting in multiple zombie processes consuming CPU resources.

## Problem

When codex credits are exhausted:
- Codex processes are not terminated cleanly
- Multiple codex processes remain running in the background
- These zombie processes consume CPU cycles unnecessarily
- No graceful shutdown mechanism exists for credit exhaustion scenarios

## Current Behavior

1. Credits run out during codex operation
2. Codex becomes unavailable but processes remain alive
3. Multiple codex processes accumulate over time
4. CPU usage increases from zombie processes
5. Manual cleanup required (kill processes)

## Expected Behavior

When codex becomes unavailable (credits exhausted):
1. Detect credit exhaustion condition
2. Trigger graceful shutdown of all codex processes
3. Clean up any remaining resources
4. Prevent new codex process spawning until credits restored
5. Log cleanup actions for audit trail

## Scope Class

\`harness\`

## Owned Surfaces

- \`scripts/ops/integrations/model/codebuff-openai-bridge.mjs\` - Codex SDK process management
- \`scripts/ops/integrations/model/symphony-credit-gate.mjs\` - Provider failure detection
- \`scripts/ops/integrations/model/symphony-openai-bridge.mjs\` - Bridge lifecycle management
- \`services/systemd/anqr-codebuff-bridge.service\` - Service restart policy

## Constraints

- Must handle both quota exhaustion and usage limit errors
- Should not interfere with active codex operations
- Must clean up child processes spawned by Codex SDK
- Should prevent process accumulation over multiple failure cycles

## Implementation Notes

From \`symphony-credit-gate.mjs\`:
\`\`\`javascript
// Codex probe already detects quota exhaustion:
const errStr = String(err).toLowerCase();
if (errStr.includes('usage limit') || errStr.includes('quota')) {
  logWarn(\`codex: unavailable (quota exhausted)\`);
  recordProviderFailure('codex');
}
\`\`\`

Need to add cleanup in this error path.

## Verification

\`\`\`bash
# Before fix - reproduce issue:
# 1. Exhaust codex credits
# 2. Check for zombie processes:
ps aux | grep codex
# Should show multiple processes

# After fix - verify cleanup:
# 1. Exhaust codex credits
# 2. Wait for cleanup (should be automatic)
# 3. Check for processes:
ps aux | grep codex
# Should show zero or minimal processes
# 4. Check logs for cleanup messages
journalctl -u anqr-codebuff-bridge --since "5 minutes ago" | grep -i cleanup
\`\`\`

## Definition Of Done

- [ ] Codex process cleanup triggers on credit exhaustion
- [ ] All child processes terminated gracefully (SIGTERM, then SIGKILL if needed)
- [ ] Process group cleanup (not just parent process)
- [ ] Cleanup logged to bridge logs
- [ ] No zombie processes remain after cleanup
- [ ] Bridge continues to function for other providers
- [ ] Service restart policy updated if needed

## Evidence Payload

- Process list before/after credit exhaustion
- Bridge logs showing cleanup actions
- CPU usage comparison (before/after fix)
- systemd service status showing clean restarts
- Commands run with pass/fail results
- Commit hash
`,
  stateId: STATES.backlog,
  labelIds: [LABELS.harness, LABELS.reliability],
  priority: 1, // High priority - resource leak
  estimate: 3, // Medium complexity - process management + error handling
});

console.log(`✅ Created: ${issue.identifier} — ${issue.title}`);
console.log(`   URL: https://linear.app/anqr/issue/${issue.identifier}`);
console.log(`   Priority: P${issue.priority} | Estimate: ${issue.estimate} points`);
