#!/usr/bin/env node

/**
 * create-rate-limit-parsing-bug-issue.mjs — Create Linear issue for rate-limit parsing bug
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Fix rate-limit parsing regex bug in symphony-adaptive-context.mjs",
  description: `## Summary

Fix incorrect regex pattern in \`parseRateLimitInfo\` that prevents proper parsing of retry-after values from error messages.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- Harness: Symphony Bridge adaptive context management
- Harness: Rate-limit throttling and backoff

## Constraints

- **Architecture**: Must maintain backward compatibility with existing rate-limit parsing
- **Launch-claim**: Harness only (not product runtime)
- **Quality**: Blocking Sonar quality checks during nightly operations

## Problem Statement

Line 343 of \`scripts/ops/integrations/model/symphony-adaptive-context.mjs\` contains a regex bug:

\`\`\`javascript
const retryMatch = errStr.match(/retry.after[:\\s]+(\\d+)/i);
\`\`\`

**Issue**: The dot in \`retry.after\` is unescaped, so it matches ANY character instead of a literal dot or hyphen. This means:
- ✅ Matches: \`"retry-after: 60"\` (correct)
- ✅ Matches: \`"retry.after: 60"\` (correct)
- ❌ Also matches: \`"retryzafter: 60"\` (incorrect - any char between 'y' and 'a') <!-- cspell:disable-line -->
- ❌ May cause false positives or incorrect parsing

**Correct pattern should be**: \`/retry[.-]after[:\\s]+(\\d+)/i\`

This matches either a literal dot OR hyphen between "retry" and "after", which covers both common formats while being precise.

## Impact

- **Severity**: P2 (Medium) - Affects rate-limit throttling accuracy
- **Blocking**: Prevents Sonar quality checks from running during nightly operations
- **Scope**: Harness only (Symphony Bridge adaptive context)
- **User impact**: May cause incorrect rate-limit backoff timing or failed parsing

## Solution

Update line 343 in \`symphony-adaptive-context.mjs\`:

\`\`\`diff
- const retryMatch = errStr.match(/retry.after[:\\s]+(\\d+)/i);
+ const retryMatch = errStr.match(/retry[.-]after[:\\s]+(\\d+)/i);
\`\`\`

## Definition Of Done

- [ ] Regex pattern fixed in \`symphony-adaptive-context.mjs\` line 343
- [ ] Existing test coverage validates the fix (no new tests needed - existing tests in \`symphony-adaptive-context.spec.ts\` lines 406-410 already cover this)
- [ ] All quality gates pass
- [ ] Sonar quality checks unblocked for nightly operations

## Verification

\`\`\`bash
# Type checking
npm run typecheck:all

# Unit tests (existing coverage validates fix)
npx vitest run scripts/ops/integrations/model/symphony-adaptive-context.spec.ts

# All quality gates
npm run lint:all
npm run depcruise:all
npm run test:unit
\`\`\`

## Evidence Payload

- Summary: Fixed regex pattern for retry-after parsing
- Scope class: docs-harness
- Touched paths: \`scripts/ops/integrations/model/symphony-adaptive-context.mjs\`
- Decisions made: Use \`[.-]\` character class to match literal dot or hyphen
- Commands run: typecheck, test:unit, lint, depcruise
- Pass/fail result for each command
- Changed files: 1 file, 1 line
- Commit hash
- Risk: Low - single character fix, existing tests validate behavior
- Follow-up work: None

## Escalate If

- Tests reveal additional regex parsing issues
- Breaking change to existing rate-limit parsing behavior detected`,
  stateId: STATES.todo,
  labelIds: [LABELS.harness, LABELS.hygiene],
  priority: 2, // Medium priority
  estimate: 1, // Low complexity (trivial regex fix)
};

async function main() {
  try {
    const issue = await createIssue(issueInput);
    console.log(`✅ Created issue: ${issue.identifier} — ${issue.title}`);
    console.log(`   URL: https://linear.app/anqr/issue/${issue.identifier}`);
    console.log(`   State: ${issue.state.name}`);
    console.log(`   Priority: P${issue.priority}`);
    console.log(`   Estimate: ${issue.estimate} point`);
  } catch (err) {
    console.error("❌ Failed to create issue:", err.message);
    process.exit(1);
  }
}

await main();
