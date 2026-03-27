#!/usr/bin/env node

/**
 * create-symphony-double-discord-issue.mjs — Create Linear issue for Symphony runner double Discord messages
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issue = {
  title: "Symphony runner generated issues causing double messages in Discord",
  description: `## Summary

Symphony runner is sending duplicate Discord notifications when processing Linear issues, causing confusion and noise in the Discord channel.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- \`scripts/ops/orchestration/symphony-runner.mjs\` — Issue execution and Linear comment creation
- \`scripts/ops/integrations/notifications/discord-webhook.mjs\` — Discord notification sending
- \`scripts/ops/integrations/model/symphony-openai-bridge.mjs\` — Discord notifications for request processing

## Current Behavior

When Symphony runner processes a Linear issue, multiple Discord messages are sent for the same event:

1. **Symphony runner start**: Sends Discord notification when beginning work on an issue
2. **Linear comment creation**: Adds comments to Linear (which may trigger webhook notifications)
3. **Symphony runner completion**: Sends Discord notification when completing work
4. **Potential webhook duplication**: If Linear webhooks are configured, they may send additional Discord notifications for the same events

This results in 2-4 Discord messages for a single Symphony runner execution cycle.

## Root Cause

The double messaging occurs because:

- Symphony runner sends Discord notifications directly via \`sendDiscordEmbed\`
- Linear comments are added via \`addComment\` which may trigger external webhook integrations
- Symphony bridge also sends Discord notifications for request start/completion
- No deduplication mechanism exists to prevent multiple notifications for the same event

## Expected Behavior

Symphony runner should send a **single** Discord notification per issue execution cycle that includes:

- Issue identifier and title
- Current status (starting, in progress, completed, failed)
- Key metrics (files changed, validation status, git commit hash)
- Error details if applicable

## Constraints

- Must maintain observability (no loss of information)
- Must not break existing Linear webhook integrations
- Must preserve Discord notification history for audit trail
- Must handle concurrent issue processing without message interleaving

## Definition Of Done

- [ ] Symphony runner sends at most ONE Discord notification per issue execution
- [ ] All relevant information (status, metrics, errors) consolidated into single message
- [ ] Linear comments remain unchanged (no Discord notification side effects)
- [ ] Symphony bridge request notifications remain separate (different context)
- [ ] Concurrent issue processing does not cause message duplication
- [ ] Existing Discord notification format preserved (embeds with fields)

## Verification

\`\`\`bash
# 1. Run Symphony runner on a test issue
node scripts/ops/orchestration/symphony-runner.mjs --once

# 2. Verify ONLY ONE Discord notification per issue execution phase:
#    - ONE "Starting" notification (optional, can be removed)
#    - ONE "Completed" or "Failed" notification (required)

# 3. Check Discord channel for duplicate messages (should be zero)

# 4. Verify Linear comments are still created correctly
linear issue ANQ-XXXX
\`\`\`

## Evidence Payload

- Discord channel screenshot showing single notification per issue
- Symphony runner logs showing notification sending
- Linear comment verification (no duplicate notifications)
- Git commit hash for the fix
- Test results confirming no regressions

## Proposed Solution

### Option 1: Consolidate Notifications (Recommended)

Remove intermediate Discord notifications and send a single comprehensive notification on completion:

\`\`\`javascript
// REMOVE: Starting notification in executeIssue()
// REMOVE: Progress notifications during validation
// KEEP: Final completion notification with all metrics

await sendDiscordEmbed({
  title: issueContext.identifier,
  description: issueContext.title,
  color: finalStateId === STATES.done ? 0x00ff00 : 0xff0000, // Green or Red
  fields: [
    { name: "Status", value: finalStateName, inline: true },
    { name: "Provider", value: metricsProviderName, inline: true },
    { name: "Files Changed", value: String(changedFiles.length), inline: true },
    { name: "Turns", value: String(agentResult.turns), inline: true },
    { name: "Validation", value: validation.passed ? "✅ Passed" : "❌ Failed", inline: true },
    { name: "Commit", value: commitHash || "N/A", inline: true },
  ],
});
\`\`\`

### Option 2: Deduplication Layer

Add a deduplication layer to \`discord-webhook.mjs\` that tracks recent messages by content hash and suppresses duplicates within a time window:

\`\`\`javascript
const recentMessages = new Map(); // contentHash -> timestamp
const DEDUP_WINDOW_MS = 60000; // 1 minute

function isDuplicate(content) {
  const hash = hashContent(content);
  const lastSent = recentMessages.get(hash);
  if (lastSent && Date.now() - lastSent < DEDUP_WINDOW_MS) {
    return true;
  }
  recentMessages.set(hash, Date.now());
  return false;
}
\`\`\`

### Option 3: Single Source of Truth

Designate Symphony runner as the ONLY source of Discord notifications for issue execution, and disable all other notification sources (Linear webhooks, Symphony bridge notifications for runner-initiated requests):

- Symphony runner: ALL issue execution notifications
- Symphony bridge: ONLY OpenClaw/Discord direct request notifications
- Linear webhooks: DISABLED for Symphony runner-managed issues

## Escalate If

- Linear webhook configuration changes are required (external to this repo)
- Discord API rate limits are exceeded due to notification volume
- Existing notification consumers rely on the current format/frequency

## Related Issues

- ANQ-XXXX: Symphony runner validation feedback (may contain related notification logic)
- ANQ-XXXX: Linear webhook integration (external system)
`,
  priority: 1, // High priority - affects user experience
  estimate: 2, // 2 story points - small fix
};

async function main() {
  console.log("Creating Symphony runner double Discord message issue...\n");

  try {
    const created = await createIssue({
      title: issue.title,
      description: issue.description,
      stateId: STATES.backlog,
      labelIds: [LABELS.harness, LABELS.bug],
      priority: issue.priority,
      estimate: issue.estimate,
    });

    console.log(`✅ Created: ${created.identifier} — ${created.title}`);
    console.log(`   URL: https://linear.app/anqr/issue/${created.identifier}`);
    console.log(`   Priority: P${created.priority} | Estimate: ${created.estimate} points\n`);
    console.log(`📊 Issue successfully created in Linear`);
  } catch (err) {
    console.error(`❌ Failed to create issue: ${err.message}`);
    process.exit(1);
  }
}

await main();
