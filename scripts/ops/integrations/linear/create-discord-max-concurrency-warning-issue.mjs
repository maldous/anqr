#!/usr/bin/env node

/**
 * create-discord-max-concurrency-warning-issue.mjs — Create Linear issue for Discord max concurrency warning
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Discord: Add large warning embed when maximum concurrency is reached",
  description: `## Summary

When the Discord router reaches maximum concurrency (4/4 worktrees busy), it returns a plain 429 response with a small text message. This is insufficient to alert the operator that their request has been rejected and will NOT be queued or retried automatically.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- Harness: Discord request router (port 18790)
- Harness: Discord webhook notification system
- Harness: OpenClaw Gateway integration

## Constraints

- **Architecture**: Router has no webhook access; must add notification capability
- **Launch-claim**: Harness only (not product runtime)
- **User impact**: High visibility required for rejected requests

## Problem Statement

Current overflow behavior (from \`discord-request-router.mjs:87-96\`):

\`\`\`javascript
function sendOverloadResponse(res) {
  const overloadMessage = {
    content: "⚠️ **System Overload** — Too many concurrent requests. Please try again in a moment.",
  };

  res.writeHead(429, {
    "Content-Type": "application/json",
    "X-RateLimit-Remaining": "0",
    "Retry-After": "30",
  });
  res.end(JSON.stringify(overloadMessage));

  logWarn(\`🚫 Overload: rejected request (\${globalActiveRequests}/\${MAX_CONCURRENT} active)\`);
}
\`\`\`

**Problems:**

1. **Small plain text message** — Easy to miss in Discord chat
2. **No visual emphasis** — Not an embedded card with color/formatting
3. **Insufficient context** — Doesn't explain that request was NOT recorded
4. **No operator alert** — Operator may not notice capacity issue
5. **No actionable guidance** — Doesn't tell user what to do

## Requirements

### R1: Large Embedded Warning Card

When 429 is returned, send a Discord webhook notification (embedded card) with:

- **Title**: "🚨 CAPACITY EXCEEDED — Request Rejected"
- **Color**: Red (0xFF0000)
- **Description**: Clear explanation that request was NOT recorded/queued
- **Fields**:
  - "Status": "4/4 worktrees busy"
  - "Action Required": "Wait 1-2 minutes and resend your request"
  - "Your Request": First 200 chars of rejected request content
- **Footer**: Timestamp of rejection

### R2: Operator Visibility

- Send to Discord webhook (same channel as normal updates)
- Use \`@here\` mention to alert active operators
- Include current queue depth if available

### R3: Rate Limiting the Warning

- Don't spam if multiple 429s in quick succession
- Max 1 warning per 60 seconds
- Log all 429s but only notify on first in the window

### R4: Request Context Preservation

If possible, include in the warning:

- User who sent the request (Discord username)
- Request timestamp
- Approximate wait time until slot available

## Implementation Plan

### Step 1: Add Discord Webhook Support to Router

\`\`\`javascript
// In discord-request-router.mjs
import { sendDiscordEmbed } from "../notifications/discord-webhook.mjs";

let lastOverloadNotification = 0;
const OVERLOAD_NOTIFICATION_COOLDOWN_MS = 60_000; // 1 minute

async function sendOverloadNotification(requestPreview) {
  const now = Date.now();
  if (now - lastOverloadNotification < OVERLOAD_NOTIFICATION_COOLDOWN_MS) {
    return; // Skip notification if we sent one recently
  }
  lastOverloadNotification = now;

  await sendDiscordEmbed({
    title: "🚨 CAPACITY EXCEEDED — Request Rejected",
    description: \`**Your request was NOT recorded or queued.**

All 4 Discord worktrees are currently busy processing other requests. This is a hard capacity limit to prevent system overload.

**What this means:**
- Your request has been rejected (HTTP 429)
- It will NOT be automatically retried
- You MUST resend your request manually

**What to do:**
- Wait 1-2 minutes for a worktree to become available
- Check the status with a simple message like "status"
- Resend your original request when capacity is available\`,
    color: 0xFF0000, // Red
    fields: [
      {
        name: "Current Status",
        value: \`\${globalActiveRequests}/\${MAX_CONCURRENT} worktrees busy\`,
        inline: true
      },
      {
        name: "Rejected At",
        value: new Date().toLocaleTimeString(),
        inline: true
      },
      {
        name: "Your Request (preview)",
        value: requestPreview.length > 200 
          ? requestPreview.slice(0, 200) + "..." 
          : requestPreview,
        inline: false
      }
    ],
    footer: "Capacity limit enforced by Discord Router"
  });

  logWarn(\`📢 Sent capacity exceeded notification to Discord\`);
}
\`\`\`

### Step 2: Extract Request Context

Before rejecting, extract request content for preview:

\`\`\`javascript
// In proxyToWorktree() before overload check
let requestPreview = "Unknown request";
try {
  const parsedBody = JSON.parse(rawBody || "{}");
  const messages = parsedBody.messages || [];
  const lastMessage = messages[messages.length - 1];
  requestPreview = lastMessage?.content || "No content";
} catch {
  requestPreview = "Could not parse request";
}

// Then in overload path:
if (isOverloaded()) {
  await sendOverloadNotification(requestPreview);
  return sendOverloadResponse(res);
}
\`\`\`

### Step 3: Update Plain Response

Keep the plain 429 response as fallback, but make it clearer:

\`\`\`javascript
const overloadMessage = {
  content: "🚨 **SYSTEM AT CAPACITY** — Your request was REJECTED and NOT queued. Check Discord for details and resend manually when capacity is available."
};
\`\`\`

### Step 4: Add Health Endpoint Info

Add to \`/health\` response:

\`\`\`javascript
status: globalActiveRequests >= MAX_CONCURRENT ? "at_capacity" : "ok",
accepting_requests: globalActiveRequests < MAX_CONCURRENT,
wait_time_estimate_seconds: globalActiveRequests >= MAX_CONCURRENT ? 120 : 0
\`\`\`

## Testing Plan

### Test 1: Trigger 429 Manually

\`\`\`bash
# Send 5 concurrent requests (max is 4)
for i in 1 2 3 4 5; do
  curl -X POST http://127.0.0.1:18790/v1/chat/completions \\
    -H "Content-Type: application/json" \\
    -d '{"model": "symphony/main", "messages": [{"role": "user", "content": "test '$i'"}], "stream": false}' &
done

# Check Discord for large warning card
# Verify:
# - Red embedded card appears
# - Contains "Request Rejected" title
# - Shows 4/4 status
# - Shows request preview "test 5"
# - Only ONE notification despite 5th request rejected
\`\`\`

### Test 2: Verify Cooldown

\`\`\`bash
# Send 2 overflow requests 30 seconds apart
# First should trigger notification
# Second should NOT (within 60s cooldown)
\`\`\`

### Test 3: Verify Normal Flow Unaffected

\`\`\`bash
# Send 1 request when capacity available
# Should NOT trigger any warning
# Should process normally
\`\`\`

## Definition Of Done

- [ ] Router sends large red embedded Discord card on 429
- [ ] Card includes clear "NOT recorded/queued" warning
- [ ] Card shows current capacity status (4/4)
- [ ] Card includes preview of rejected request
- [ ] Notification rate-limited (max 1 per 60 seconds)
- [ ] Plain 429 response text updated for clarity
- [ ] Health endpoint includes \`accepting_requests\` field
- [ ] Tested with real Discord overflow scenario
- [ ] Evidence document with screenshot of warning card

## Impact

- **Severity**: P2 (High) - User requests silently dropped without awareness
- **Scope**: Discord request overflow handling
- **User impact**: High - prevents lost/forgotten requests
- **Operational impact**: High - alerts operator to capacity issues

## Files to Modify

1. \`scripts/ops/integrations/model/discord-request-router.mjs\`
   - Add \`sendDiscordEmbed\` import
   - Add \`sendOverloadNotification()\` function
   - Add cooldown tracking
   - Extract request preview before rejection
   - Call notification before sending 429

2. \`scripts/ops/integrations/notifications/discord-webhook.mjs\`
   - Already has \`sendDiscordEmbed\` — no changes needed

3. \`docs/harness/12-concurrent-execution-with-worktrees.md\`
   - Document the new overflow notification behavior
   - Add to troubleshooting section

## Verification Commands

\`\`\`bash
# After implementation, test overflow:
# Terminal 1: Monitor router logs
journalctl --user -u anqr-discord-router.service -f

# Terminal 2: Send 5 concurrent requests
for i in 1 2 3 4 5; do
  curl -X POST http://127.0.0.1:18790/v1/chat/completions \\
    -H "Content-Type: application/json" \\
    -d '{"model": "symphony/main", "messages": [{"role": "user", "content": "overflow test '$i'"}]}' &
done

# Expected:
# - Router logs show "📢 Sent capacity exceeded notification to Discord"
# - Discord shows large red card with "🚨 CAPACITY EXCEEDED"
# - Card includes "overflow test 5" preview
# - Only ONE notification sent despite rejection
\`\`\`

## Evidence Payload

- Summary: Discord max concurrency warning embedded card
- Scope class: docs-harness
- Touched paths: discord-request-router.mjs, documentation
- Decisions made: Red embed, 60s cooldown, request preview in card
- Commands run: Overflow load test, Discord notification verification
- Pass/fail result: Large warning card appears on 429, operator alerted
- Risk: Low - purely additive notification enhancement
- Follow-up work: Consider auto-retry mechanism for rejected requests

## References

- \`scripts/ops/integrations/model/discord-request-router.mjs\` (sendOverloadResponse)
- \`scripts/ops/integrations/notifications/discord-webhook.mjs\` (sendDiscordEmbed)
- \`docs/harness/12-concurrent-execution-with-worktrees.md\` Section 10 (Operations)
- Phase 7 testing (Test 7.2: Max Concurrency Test) — verified 429 behavior`,
  stateId: STATES.todo,
  labelIds: [LABELS.harness, LABELS.reliability],
  priority: 2, // P2 - High priority for operator visibility
  estimate: 2,
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
