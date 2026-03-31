#!/usr/bin/env node

/**
 * create-discord-streaming-delay-issue.mjs — Create Linear issue for Discord streaming delay
 *
 * Issue: Streaming events are not arriving in realtime in Discord
 * Root cause: 5-second batching interval in discord-webhook.mjs streamDiscordUpdate()
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueData = {
  title: "Discord streaming events delayed by 5-second batching interval",
  description: `## Summary

Streaming events from Symphony/Codebuff agents are not arriving in realtime in Discord. Messages are batched and sent every 5 seconds, creating a delayed and choppy user experience.

## Current Behavior

**Location**: \`scripts/ops/integrations/notifications/discord-webhook.mjs\`

The \`streamDiscordUpdate()\` function accumulates streaming text in a buffer and flushes every **5 seconds** (or when buffer exceeds 1900 chars):

\`\`\`javascript
const DISCORD_STREAM_INTERVAL_MS = 5000; // Send every 5 seconds to preserve formatting
\`\`\`

This batching was introduced to:
- Preserve natural formatting
- Prevent fragmented messages
- Handle per-request buffering to prevent concurrent request mixing

## Problem

1. **User Experience**: 5-second delays make the interaction feel unresponsive
2. **Real-time expectation**: Users expect streaming responses to arrive continuously, not in 5-second chunks
3. **Inconsistent with other channels**: Web/API streaming is realtime

## Expected Behavior

Streaming events should arrive in Discord with sub-second latency while still:
- Preserving message formatting
- Preventing message fragmentation
- Handling concurrent requests correctly

## Proposed Solutions

### Option 1: Reduce Batching Interval (Quick Fix)
- Change \`DISCORD_STREAM_INTERVAL_MS\` from 5000ms to 500ms-1000ms
- Pros: Simple one-line change
- Cons: May increase Discord API rate limit risk, more frequent small messages

### Option 2: Adaptive Batching (Balanced)
- Use shorter interval (500ms) for first few chunks to show immediate feedback
- Increase to 2-3s for subsequent chunks once user sees progress
- Pros: Best of both worlds - responsive start, efficient continuation
- Cons: More complex logic

### Option 3: Webhook Alternative (Advanced)
- Investigate Discord's message editing API to update a single message
- Stream content by editing the same message repeatedly
- Pros: Single message, truly realtime updates
- Cons: Requires Discord bot integration, not just webhooks

### Option 4: SSE/WebSocket Bridge (Future)
- Add WebSocket support to Discord bot for true streaming
- Bypass webhook batching entirely
- Pros: True realtime, no batching needed
- Cons: Significant architecture change

## Recommendation

Start with **Option 1** (reduce to 1000ms) as immediate relief, then evaluate **Option 2** if needed.

## Scope Class

\`api-mcp\`

## Owned Surfaces

- \`scripts/ops/integrations/notifications/discord-webhook.mjs\`
- Specifically: \`streamDiscordUpdate()\`, \`flushDiscordStream()\`
- \`DISCORD_STREAM_INTERVAL_MS\` constant

## Related Files

- \`scripts/ops/runtime/symphony/symphony-agent.mjs\` - Calls streaming updates
- \`scripts/ops/integrations/model/discord-request-router.mjs\` - Routes Discord requests
- \`services/systemd/anqr-discord-bridge@.service\` - Discord bridge service
- \`docs/harness/discord-voice-integration.md\` - Discord integration architecture

## Constraints

- Must maintain per-request buffering to prevent message mixing
- Must respect Discord API rate limits (avoid 429 errors)
- Must preserve message formatting (avoid truncation mid-word)
- Must handle buffer overflow gracefully (max 2000 chars per message)

## Testing Plan

1. **Unit Tests**:
   - Test \`streamDiscordUpdate()\` with various intervals
   - Verify per-request buffering prevents mixing
   - Validate buffer overflow handling

2. **Integration Tests**:
   - Run concurrent Discord requests with streaming
   - Verify messages don't mix between requests
   - Check Discord API rate limit compliance

3. **Manual Testing**:
   - Trigger Symphony agent via Discord command
   - Observe streaming response timing
   - Measure time-to-first-chunk and chunk frequency

## Definition of Done

- [ ] \`DISCORD_STREAM_INTERVAL_MS\` reduced from 5000ms to acceptable value (500-1000ms)
- [ ] Unit tests added for streaming update timing
- [ ] Integration tests verify concurrent request isolation
- [ ] Manual Discord testing confirms improved responsiveness
- [ ] No Discord API rate limit errors in production
- [ ] Documentation updated in \`discord-voice-integration.md\`

## Verification Commands

\`\`\`bash
# Run unit tests
npm run test:unit -- discord-webhook

# Run integration tests
npm run test:integration -- discord

# Manual test via Discord
# 1. Send command to Discord bot
# 2. Observe streaming response timing
# 3. Verify no message mixing with concurrent requests
\`\`\`

## Evidence Payload

- Before/after timing measurements from Discord
- Test results showing no message mixing
- Discord API rate limit monitoring (no 429s)
- User feedback on improved responsiveness
- Commit hash

## Related Issues

- Gateway singleton lock (ANQ-1137) - Ensures single Discord gateway instance
- Discord duplicate requests fix - Fixed in earlier work
- Symphony streaming infrastructure - Uses this webhook layer

## Priority Justification

**Priority 2 (High)**: User-facing issue affecting perceived responsiveness of AI interactions via Discord. Not blocking core functionality but significantly impacts UX.

**Estimate**: 2-3 points
- 1 point: Change constant, basic testing
- +1 point: Add unit/integration tests
- +0.5 point: Documentation updates, monitoring
`,
  stateId: STATES.backlog,
  labelIds: [LABELS.harness, LABELS.reliability],
  priority: 2, // High priority - user-facing UX issue
  estimate: 2, // 2-3 story points
};

async function main() {
  console.log("Creating Discord streaming delay Linear issue...\n");

  try {
    const issue = await createIssue(issueData);

    console.log(`✅ Created: ${issue.identifier} — ${issue.title}`);
    console.log(`   URL: https://linear.app/anqr/issue/${issue.identifier}`);
    console.log(`   State: ${issue.state.name}`);
    console.log(`   Priority: P${issue.priority} | Estimate: ${issue.estimate} points`);
    console.log(`   Labels: ${issue.labels.nodes.map((l) => l.name).join(", ")}`);
    console.log("\n✅ Issue created successfully!");
    console.log(
      "\nNext steps: Review the issue in Linear and adjust priority/estimate if needed.",
    );
  } catch (err) {
    console.error(`❌ Failed to create issue: ${err.message}`);
    process.exit(1);
  }
}

await main();
