#!/usr/bin/env node

/**
 * create-grok-context-issue.mjs — Create Linear issue for Grok context understanding
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Investigate and fix Grok model context understanding during startup",
  description: `## Summary

Determine root cause and implement solution for Grok model failing to understand conversation context when selected at startup or mid-conversation.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- Harness: Symphony Bridge provider routing
- Harness: Session state management
- Harness: Context truncation and message continuity

## Constraints

- **Architecture**: Must preserve existing provider cascade and failover logic
- **Launch-claim**: Harness only (not product runtime)
- **Cost**: No paid provider changes required

## Problem Statement

User reports: "The grok model is very bad at understanding contact when starting up."

Known architectural concern documented in \`symphony-session-state.mjs\`:

> This module tracks provider selection (which provider, turn count, tier) but does NOT
> track the actual message history. The system relies on OpenClaw maintaining conversation
> state. When switching providers mid-conversation (due to rotation, failure, or evaluation),
> there is NO server-side verification that:
>   1. The context sent by OpenClaw is complete and coherent
>   2. The context hasn't been corrupted during transmission
>   3. The truncated context (for providers with smaller windows) maintains coherence
>
> Known failure: Groq switching mid-conversation (2026-03-27) "had no idea what was going on"

## Investigation Areas

1. **Context truncation**: Review \`symphony-bridge-truncation.mjs\` for Grok-specific issues
   - Verify \`PROVIDER_MAX_INPUT_TOKENS\` ceiling for Groq provider
   - Check message truncation logic preserves conversation coherence
   - Ensure system messages and role alternation are preserved

2. **Session state continuity**: Review \`symphony-session-state.mjs\`
   - Implement message hash verification for provider switches
   - Add context coherence validation (role alternation, system message presence)
   - Consider server-side message history as source of truth

3. **Adaptive context interaction**: Review \`symphony-adaptive-context.mjs\`
   - Check if dynamic context shrinking for Groq is too aggressive
   - Verify Groq-specific error classification patterns
   - Review TPM proactive reduction impact on startup requests

4. **Provider selection timing**: Review \`symphony-openai-bridge.mjs\`
   - Investigate first-request context handling for Groq
   - Check if initial selection bypasses necessary context setup
   - Review sticky session initialization

## Potential Solutions

**Option 1: Message Hash Verification**
- Store message hash when provider switches
- Verify continuity on next request
- Reject/warn on hash mismatch

**Option 2: Server-Side Message History**
- Store full message array in session state
- Use as source of truth for provider switches
- Eliminates reliance on OpenClaw state

**Option 3: Context Coherence Validation**
- Validate role alternation (user/assistant pattern)
- Ensure system message present
- Check for truncation mid-turn
- Log warnings for incoherent context

**Option 4: Groq-Specific Startup Handling**
- Add provider-specific context initialization
- Ensure first request includes full system context
- Bypass adaptive shrinking on initial request

## Definition Of Done

- [ ] Root cause identified and documented
- [ ] Solution implemented (one or more options above)
- [ ] Tests added covering Groq startup scenarios
- [ ] Groq mid-conversation switches validated
- [ ] No regression in other provider startup behavior
- [ ] Updated architectural documentation in \`symphony-session-state.mjs\`

## Verification

\`\`\`bash
# Type checking
npm run typecheck:all

# Unit tests
npm run test:unit

# E2E tests including OpenClaw/Symphony integration
npx vitest run tests/e2e/openclaw-symphony.spec.ts

# Manual validation
# 1. Start fresh OpenClaw session
# 2. Force Groq selection via model override
# 3. Verify first response demonstrates context understanding
# 4. Switch providers mid-conversation
# 5. Verify Groq understands context when re-selected
\`\`\`

## Evidence Payload

- Summary of root cause
- Solution approach selected
- Code changes in affected modules
- Test coverage additions
- Before/after examples of Groq context understanding
- Performance impact (if any)
- Commands run with pass/fail results
- Commit hash
- Risk assessment

## Escalate If

- Solution requires changes to OpenClaw protocol
- Requires modification of provider API contracts
- Performance impact exceeds 10ms per request
- Breaking change to existing session state format`,
  stateId: STATES.backlog,
  labelIds: [LABELS.harness],
  priority: 2, // Medium priority
  estimate: 5, // Medium complexity (3-5 points)
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
