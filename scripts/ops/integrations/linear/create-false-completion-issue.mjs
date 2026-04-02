#!/usr/bin/env node

/**
 * create-false-completion-issue.mjs — Create Linear issue for ANQ-1379 false completion
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "False completion: ANQ-1379 marked Done without executing quality gate",
  description: `## Problem

ANQ-1379 was marked as completed at 2026-04-03 00:09:57 with message "agent completed, no changes needed" but there is no evidence in the logs that the quality gate was actually executed.

## Evidence

From journal logs:
- 00:00:15 - Runner started ANQ-1379: "Run full quality gate"
- 00:00:55 - Created subgoal 0: "Starting quality gate execution: ANQ-1379"
- 00:01:47 - Created subgoal phase_1_verify_previous_work
- 00:01:49 - Started verification of previous work
- **00:09:57 - Jumped to completion** with "✅ Completed: ANQ-1379 — Run full quality gate (agent completed, no changes needed)"

**Missing from logs:**
- No test execution (npm test, vitest, etc.)
- No linting output (npm run lint)
- No type checking (tsc --noEmit)
- No build verification
- No evidence document creation

## Root Cause

The agent falsely reported successful completion when no quality gate work was performed. This represents a critical failure in the completion detection logic - the agent appears to have decided the work was "already done" without verifying it.

## Impact

- **Trust erosion**: Users cannot trust completion status
- **Quality bypass**: Quality gates may be bypassed silently
- **Technical debt**: Issues accumulate undetected
- **False metrics**: Completion stats are incorrect

## Required Fix

1. **Add completion evidence validation**: Never mark quality gate issues as complete without verifiable output
2. **Require proof**: Quality gate completion must include test results, lint output, typecheck output
3. **Evidence document**: Quality gate runs must create evidence document in \`docs/harness/evidence/\`
4. **Verification step**: Add final verification step that checks for required output before marking complete

## Diagnostic Commands

\`\`\`bash
# Review ANQ-1379 execution logs
journalctl --user -u anqr-symphony-executor@wt1.service --since "2026-04-03 00:00:00" --until "2026-04-03 00:15:00" | grep -E "(1379|quality gate)" -A 5

# Check for test execution evidence
journalctl --user -u anqr-symphony-executor@wt1.service --since "2026-04-03 00:00:00" --until "2026-04-03 00:15:00" | grep -E "(npm test|vitest|jest|playwright)"

# Check for lint execution
journalctl --user -u anqr-symphony-executor@wt1.service --since "2026-04-03 00:00:00" --until "2026-04-03 00:15:00" | grep -E "(npm run lint|eslint)"

# Check for typecheck execution
journalctl --user -u anqr-symphony-executor@wt1.service --since "2026-04-03 00:00:00" --until "2026-04-03 00:15:00" | grep -E "(tsc --noEmit|typecheck)"

# Check for evidence document
ls -la docs/harness/evidence/ANQ-1379*.md
\`\`\`

## Definition Of Done

- [ ] Root cause identified in agent completion logic
- [ ] Completion validation added to quality gate runner
- [ ] Evidence requirement enforced for quality gate issues
- [ ] ANQ-1379 re-run successfully with full quality gate execution
- [ ] Evidence document created with pass/fail results
- [ ] Tests added to prevent false completions

## Next Steps

1. Review symphony-runner.mjs completion detection logic
2. Add requirement for evidence document before marking quality gates complete
3. Re-run ANQ-1379 to verify actual quality gate execution
4. Create evidence document template for quality gate runs`,
  stateId: STATES.todo,
  labelIds: [LABELS.harness],
  priority: 0, // P0 - critical trust issue
  estimate: 3,
};

async function main() {
  try {
    const issue = await createIssue(issueInput);
    console.log(`✅ Created issue: ${issue.identifier} — ${issue.title}`);
    console.log(`   URL: https://linear.app/anqr/issue/${issue.identifier}`);
  } catch (err) {
    console.error("❌ Failed to create issue:", err.message);
    process.exit(1);
  }
}

await main();
