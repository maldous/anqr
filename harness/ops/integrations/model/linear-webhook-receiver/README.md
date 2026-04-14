# Linear Webhook Receiver

## Purpose

Authenticated Linear ingress surface that validates webhook events, records evidence, and turns accepted events into scheduler-path desired-work signals rather than directly claiming work.

## Contents

- 16 immediate files
- 0 child directories

## Key Files

- `active-issues.mjs` - Exports `activeIssues`, a shared constant or state value used by sibling modules.
- `dedup-window-ms.mjs` - Exports `DEDUP_WINDOW_MS`, a shared constant or state value used by sibling modules.
- `handle-health.mjs` - Exports `handleHealth`, the main helper defined in this file.
- `handle-webhook.mjs` - Exports `handleWebhook`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-duplicate.mjs` - Exports `isDuplicate`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `port.mjs` - Exports `PORT`, a shared constant or state value used by sibling modules.
- `recent-deliveries.mjs` - Exports `recentDeliveries`, a shared constant or state value used by sibling modules.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `server.mjs` - Exports `server`, a shared constant or state value used by sibling modules.
- `should-process-event.mjs` - Exports `shouldProcessEvent`, the main helper defined in this file.
- `trigger-issue-execution.mjs` - Exports `triggerIssueExecution`, the main helper defined in this file.
- `verify-signature.mjs` - Exports `verifySignature`, the main helper defined in this file.
- `webhook-secret.mjs` - Exports `WEBHOOK_SECRET`, a shared constant or state value used by sibling modules.
- `worktree-ids.mjs` - Exports `WORKTREE_IDS`, a shared constant or state value used by sibling modules.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- This receiver verifies the Linear signature, deduplicates deliveries, records ingress evidence, and then triggers the scheduler-aligned path.
- Its role after Workstream A is write-side ingress and traceability, not independent dispatch authority.

## Review Focus

Confirm that webhook handling remains ingress-only and does not recreate an alternate global dispatcher.
