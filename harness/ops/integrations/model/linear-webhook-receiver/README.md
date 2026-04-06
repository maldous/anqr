# ANQR Linear Webhook Receiver

## 1. Directory Overview

This directory implements **ANQR Linear Webhook Receiver** within the ANQR harness. The immediate code includes a standalone runtime entry point alongside helper modules. The current inventory is 16 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **active-issues.mjs** - Exports `activeIssues`, a shared `Set` constant used by this module group.
- **dedup-window-ms.mjs** - Exports `DEDUP_WINDOW_MS`, a shared constant used by sibling modules.
- **handle-health.mjs** - Exports `handleHealth`, which implements handle health.
- **handle-webhook.mjs** - Exports `handleWebhook`, which implements handle webhook.
- **index.mjs** - Facade module that re-exports public members from `./port.mjs`, `./webhook-secret.mjs`, `./worktree-ids.mjs`, `./recent-deliveries.mjs`, `./dedup-window-ms.mjs`, `./active-issues.mjs`, and 7 more siblings.
- **is-duplicate.mjs** - Exports `isDuplicate`, which checks whether duplicate.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **port.mjs** - Exports `PORT`, a shared constant used by sibling modules.
- **recent-deliveries.mjs** - Exports `recentDeliveries`, a shared `Set` constant used by this module group.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **server.mjs** - Exports `server`, which implements server.
- **should-process-event.mjs** - Exports `shouldProcessEvent`, which implements should process event.
- **trigger-issue-execution.mjs** - Exports `triggerIssueExecution`, which implements trigger issue execution.
- **verify-signature.mjs** - Exports `verifySignature`, which verifies signature.
- **webhook-secret.mjs** - Exports `WEBHOOK_SECRET`, a shared constant used by sibling modules.
- **worktree-ids.mjs** - Exports `WORKTREE_IDS`, a shared constant used by sibling modules.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include network/API integration, timer, scheduling, cooldown, or watchdog behavior, Linear integration, Discord integration, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/integrations/model/linear-webhook-receiver/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:crypto`, `node:http`
- **Internal relative modules** - `../../../core/discord-source.mjs`, `../../../lib/logger.mjs`, `./active-issues.mjs`, `./handle-health.mjs`, `./handle-webhook.mjs`, `./is-duplicate.mjs`, `./logger.mjs`, `./port.mjs`, `./recent-deliveries.mjs`, `./should-process-event.mjs`, `./trigger-issue-execution.mjs`, `./verify-signature.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
