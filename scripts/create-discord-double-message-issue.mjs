#!/usr/bin/env node

/**
 * Create Linear issue for Discord double message bug fix
 */

import { createIssue, STATES, LABELS } from './ops/integrations/linear/linear-client.mjs';

const issue = await createIssue({
  title: 'Fix double messages in Discord notifications from Linear/Symphony integration',
  description: `## Summary

Discord notifications are showing duplicate messages when Linear issues are being processed through Symphony/Codebuff integration.

## Root Cause

In \`codebuff-openai-bridge.mjs\`, the \`formatToolCallDisplay()\` function returns formatted messages (e.g., "💻 Running: \${cmd}") which are being sent to Discord through two paths:
1. Logged via \`logDebug()\` 
2. Streamed via \`streamActivity()\`

This creates duplicate output in Discord feeds.

## Example

\`\`\`
Let me check the full test output to see if the integration test is actually running:
💻 Running: npm run test:unit 2>&1 | grep -A 5 "harness-bridge"
Let me check the full test output to see if the integration test is actually running:
💻 Running: npm run test:unit 2>&1 | grep -A 5 "harness-bridge"
\`\`\`

## Scope Class

\`harness-ops\`

## Owned Surfaces

- \`scripts/ops/integrations/model/codebuff-openai-bridge.mjs\`
- \`scripts/ops/integrations/notifications/discord-webhook.mjs\`
- Discord webhook integration

## Constraints

- Must preserve server-side logging for debugging
- Must maintain clean user-facing Discord stream
- Cannot break existing streaming behavior
- Must work for both streaming and non-streaming modes

## Definition Of Done

- Discord notifications show each message only once
- Server-side logs still capture all events for debugging
- Tool activity messages (📖, ✏️, 💻, ✅) appear once in Discord
- Streaming behavior remains intact
- No duplicate "Let me check..." or similar messages

## Verification

\`\`\`bash
# Monitor Discord webhook during Symphony run
# Verify no duplicate messages appear in Discord channel
# Check server logs still contain debug info
\`\`\`

## AI Hint

The fix likely involves:
1. Removing the \`logDebug()\` call when \`streamActivity()\` is being used, OR
2. Making \`logDebug()\` not forward to Discord (keeping it server-side only), OR
3. Consolidating the two output paths into a single path

The \`handleEvent\` function in \`trySingleAccountStream\` calls both \`logDebug()\` and \`streamActivity()\` with the same formatted message from \`formatToolCallDisplay()\`.

## Escalate If

- Changes affect non-Discord logging infrastructure
- Streaming protocol changes required`,
  stateId: STATES.todo,
  labelIds: [LABELS.harness, LABELS.bug],
  priority: 2, // High priority - affects user experience
});

console.log(`✅ Created issue: ${issue.identifier} — ${issue.title}`);
console.log(`   URL: https://linear.app/anqr/issue/${issue.identifier}`);
