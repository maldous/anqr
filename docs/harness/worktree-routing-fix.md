# Discord Worktree Routing Fix

## Problem

Multiple Discord worktrees (wt6, wt7, wt8) were picking up the same issue when a Discord request came in. This happened because:

1. Discord-created issues were NOT marked with `source: "discord"` in symphony-state
2. `isDiscordIssue()` in symphony-runner.mjs checks `state.source`
3. Without the source set, the worktree routing filter passed ALL issues to ALL worktrees
4. Multiple Discord worktrees could pick up the same issue simultaneously

## Root Cause

The source was only set AFTER an issue was picked (in `noteAttemptStart`), but the routing filter in `pickIssue()` runs BEFORE that. This created a race condition where multiple worktrees could pick up the same issue before any of them marked it with a source.

## Solution

Set `source: "discord"` in symphony-state BEFORE issues are picked, at two key points:

### 1. Queue Feeding (`symphony-queue-control.mjs`)

When issues are promoted from Backlog to Todo via `feedQueue()`, detect if they're Discord-sourced and mark them:

```javascript
import { isDiscordSourced, markDiscordSource } from "../core/discord-source.mjs";

for (const issue of toFeed) {
  await updateIssue(issue.id, { stateId: STATES.todo });

  const fromDiscord = isDiscordSourced(issue);
  if (fromDiscord) {
    markDiscordSource(issue.identifier);
  }

  logAction(
    "feed",
    `Promoted ${issue.identifier} to Todo: ${issue.title}${fromDiscord ? " (Discord)" : ""}`,
  );
}
```

### 2. Linear Webhook (`linear-webhook-receiver.mjs`)

When receiving Linear webhook events, fetch the issue and mark Discord-sourced issues:

```javascript
import { detectAndMarkDiscordSource } from "../../core/discord-source.mjs";

const issueData = await getIssue(processedEvent.identifier);
if (issueData && detectAndMarkDiscordSource(issueData, processedEvent.identifier)) {
  logInfo(`Marked ${processedEvent.identifier} as Discord-sourced`);
}
```

### 3. Shared Utility (`discord-source.mjs`)

Created a shared utility to avoid code duplication:

```javascript
export function isDiscordSourced(issueData) {
  if (!issueData) return false;

  const discordLabelId = process.env.DISCORD_LABEL_ID;

  // Check for Discord label
  if (discordLabelId) {
    const labels = issueData.labels?.nodes || [];
    const hasDiscordLabel = labels.some(
      (l) => l.id === discordLabelId || l.name.toLowerCase().includes("discord"),
    );
    if (hasDiscordLabel) return true;
  }

  // Check if creator is Discord bot
  const createdBy = issueData.createdBy;
  if (createdBy) {
    const creatorIsDiscord =
      createdBy.email?.toLowerCase().includes("discord") ||
      createdBy.name?.toLowerCase().includes("discord") ||
      createdBy.id === process.env.DISCORD_BOT_USER_ID;
    if (creatorIsDiscord) return true;
  }

  return false;
}

export function markDiscordSource(issueIdentifier) {
  const state = getIssueState(issueIdentifier);
  if (state.source !== "discord") {
    patchIssueState(issueIdentifier, { ...state, source: "discord" });
  }
}

export function detectAndMarkDiscordSource(issueData, issueIdentifier) {
  if (isDiscordSourced(issueData)) {
    markDiscordSource(issueIdentifier);
    return true;
  }
  return false;
}
```

## Configuration

Add the Discord label ID to your environment:

```bash
# ~/.config/systemd/user/anqr-ops.env
DISCORD_LABEL_ID=9341d965-e21d-4c3d-81b2-73beff08356d
```

The label "source:discord" must exist in your Linear workspace.

## Files Modified

- `scripts/ops/core/discord-source.mjs` (new shared utility)
- `scripts/ops/orchestration/symphony-queue-control.mjs` (mark source when feeding)
- `scripts/ops/integrations/model/linear-webhook-receiver.mjs` (mark source on webhook)
- `services/systemd/anqr-linear-webhook.service` (documented env var)
- `services/systemd/anqr-queue-feeder.service` (documented env var)
- `services/systemd/anqr-symphony-executor@.service` (documented env var)
- `tests/unit/discord-source.spec.ts` (14 unit tests)
- `tests/integration/discord-worktree-routing.spec.ts` (integration tests)

## How It Works

1. **Issue Created in Discord** → Discord bot creates Linear issue with "source:discord" label
2. **Webhook Received** → `linear-webhook-receiver.mjs` marks issue as Discord-sourced in symphony-state
3. **Queue Feeding** → `symphony-queue-control.mjs` marks source when promoting Backlog → Todo
4. **Issue Picking** → `symphony-runner.mjs` calls `pickIssue()` which filters based on source:
   - Discord worktrees (wt5-wt8): only pick issues with `source: "discord"`
   - Symphony worktrees (wt1-wt4): only pick issues WITHOUT `source: "discord"`
5. **Execution** → Only ONE worktree picks up each issue

## Testing

Run all tests:

```bash
# Unit tests
npx vitest run tests/unit/discord-source.spec.ts

# Related routing tests
npx vitest run tests/unit/discord-router.spec.ts tests/unit/queue-control.spec.ts
```

## Verification

Monitor Discord #general2 channel to verify only one worktree processes each request:

Before fix:

```
⏳ Processing Request | wt6
⏳ Processing Request | wt7
⏳ Processing Request | wt8
```

After fix:

```
⏳ Processing Request | wt6
✅ Done | wt6
```

## Related

- `docs/harness/04-provider-routing.md` - Provider cascade architecture
- `docs/workflows/symphony-execution.md` - Execution workflow
- `scripts/ops/orchestration/symphony-runner.mjs` - Runner implementation with worktree routing
