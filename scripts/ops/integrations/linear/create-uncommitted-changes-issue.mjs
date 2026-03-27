#!/usr/bin/env node

/**
 * create-uncommitted-changes-issue.mjs — Create Linear issue for uncommitted harness changes
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Review and commit uncommitted harness changes (tool suppression, watchdog fix, bridge-watchdog misplacement)",
  description: `## Summary

Review and properly commit uncommitted changes in working tree from interactive mode:

1. Tool activity message suppression in Symphony bridge
2. ESLint fix for watchdog infinite loop false positive
3. Misplaced bridge-watchdog.mjs file in project root
4. New Linear script for rate limit parsing bugs

## Scope Class

\`docs-harness\`

## Owned Surfaces

- Harness: Symphony Bridge streaming output
- Harness: Watchdog monitoring service
- Harness: Linear integration scripts

## Constraints

- **Architecture**: Changes must preserve streaming contract and watchdog behavior
- **Launch-claim**: Harness only (not product runtime)
- **Git**: Must commit before Symphony runner can proceed

## Uncommitted Changes

### Modified Files

**1. scripts/ops/integrations/model/symphony-openai-bridge.mjs**
- Suppressed tool activity messages (\`🔧\` toolName, \`✅\` toolName done) from streaming output
- Tool calls still logged server-side but not sent to client/Discord
- Reduces noise in Discord notifications
- Comment added: "Tool activity messages are logged server-side but NOT sent to client/Discord to avoid noise"

**2. scripts/ops/runtime/watchdog/bridge-watchdog.mjs**
- Added ESLint disable comment for false-positive infinite loop warning
- \`shuttingDown\` variable is modified by signal handlers (SIGTERM, SIGINT)
- Comment: \`// shuttingDown is modified by signal handlers (SIGTERM, SIGINT)\`
- Fixes Sonar BLOCKER S2189 issue

### Untracked Files

**3. bridge-watchdog.mjs (project root)**
- ❌ Misplaced file — should not exist in project root
- Likely accidental copy from \`scripts/ops/runtime/watchdog/bridge-watchdog.mjs\`
- **Action**: Delete this file (use \`git clean -f bridge-watchdog.mjs\`)

**4. scripts/ops/integrations/linear/create-rate-limit-parsing-bug-issue.mjs**
- New Linear integration script for rate limit parsing bugs
- Follows pattern from existing \`create-grok-context-issue.mjs\`
- **Action**: Review content and add to git if appropriate

## Tasks

- [ ] Review diff for symphony-openai-bridge.mjs tool suppression changes
- [ ] Review diff for bridge-watchdog.mjs ESLint fix
- [ ] Verify bridge-watchdog.mjs in project root is duplicate (delete if so)
- [ ] Review create-rate-limit-parsing-bug-issue.mjs content
- [ ] Ensure changes align with harness streaming contract
- [ ] Run quality gates: \`npm run typecheck:all && npm run lint:all\`
- [ ] Commit changes with proper message
- [ ] Push to remote before next Symphony run

## Definition Of Done

- [ ] All changes reviewed and understood
- [ ] Misplaced bridge-watchdog.mjs deleted
- [ ] Quality gates pass
- [ ] Git working tree clean (\`git status\` shows no changes)
- [ ] Changes pushed to remote
- [ ] Symphony runner can proceed (\`gitIsClean()\` check passes)

## Verification

\`\`\`bash
# Review changes
git status
git diff scripts/ops/integrations/model/symphony-openai-bridge.mjs
git diff scripts/ops/runtime/watchdog/bridge-watchdog.mjs

# Check untracked files
ls -la bridge-watchdog.mjs
cat scripts/ops/integrations/linear/create-rate-limit-parsing-bug-issue.mjs

# Quality gates
npm run typecheck:all
npm run lint:all

# Commit
git add scripts/ops/integrations/model/symphony-openai-bridge.mjs
git add scripts/ops/runtime/watchdog/bridge-watchdog.mjs
git add scripts/ops/integrations/linear/create-rate-limit-parsing-bug-issue.mjs
git commit -m "fix(harness): suppress tool activity from streaming, fix watchdog ESLint warning

- Symphony bridge: Filter tool call/result messages from client stream (logged server-side)
- Watchdog: Add ESLint disable for shuttingDown loop (modified by signal handlers)
- Linear: Add create-rate-limit-parsing-bug-issue.mjs script"

# Clean up misplaced file
git clean -f bridge-watchdog.mjs

# Push
git push
\`\`\`

## Evidence Payload

- Git status before and after
- Diff review summary
- Quality gate results
- Commit hash
- Confirmation of clean working tree

## Escalate If

- Changes affect product runtime streaming behavior
- Quality gates fail
- Unclear why bridge-watchdog.mjs exists in project root
- create-rate-limit-parsing-bug-issue.mjs has unexpected content`,
  stateId: STATES.backlog,
  labelIds: [LABELS.harness],
  priority: 1, // High priority (blocks Symphony runner)
  estimate: 1, // Low complexity
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
