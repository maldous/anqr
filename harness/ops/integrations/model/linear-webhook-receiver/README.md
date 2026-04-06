# ANQR Linear Webhook Receiver

## 1. Directory Overview

This directory contains the Linear Webhook Receiver for the ANQR (Agentic Number Query Runner)
harness. It provides a webhook endpoint that receives events from Linear's issue tracking system and
triggers execution on worktrees when issues move to actionable states (Todo or In Progress). The
receiver acts as the bridge between Linear's event system and the Symphony orchestration engine. It
currently contains 16 files and 0 subdirectories.

## 2. File Summaries

### Files

- **active-issues.mjs** - Set tracking issues currently being processed to prevent duplicate triggers.
- **dedup-window-ms.mjs** - Deduplication window constant set to 60,000ms (1 minute).
- **handle-health.mjs** - Health check endpoint handler. Returns JSON status including port, worktree IDs, and overall health status at `/health` or `/`.
- **handle-webhook.mjs** - Main webhook handling logic. Validates webhook signatures, checks for duplicates, parses events, detects Discord-sourced issues, and triggers execution on the least-loaded worktree. Returns appropriate HTTP status codes (200 for success, 503 if router unavailable, 500 for errors).
- **index.mjs** - Facade index exporting all public API members including PORT, WEBHOOK_SECRET, WORKTREE_IDS, recentDeliveries, activeIssues, verifySignature, isDuplicate, shouldProcessEvent, triggerIssueExecution, handleHealth, handleWebhook, and server.
- **is-duplicate.mjs** - Duplicate detection using recentDeliveries Set. Returns true and logs warning for duplicates, adds to Set and returns false for new delivery IDs.
- **logger.mjs** - Shared logger module using the project's logger library with logInfo, logWarn, logError, and logDebug exports.
- **port.mjs** - Port configuration. Defaults to `18791` via `LINEAR_WEBHOOK_PORT` environment variable.
- **recent-deliveries.mjs** - Set tracking recent delivery IDs for deduplication across webhook retries.
- **runtime.mjs** - Runtime entry point. Starts HTTP server on configured port, initializes deduplication cleanup interval (60s), active issues cleanup interval (5min), and handles SIGTERM/SIGINT for graceful shutdown.
- **server.mjs** - HTTP server creation using Node.js `http` module. Routes GET requests to `/health` or `/` for health checks, POST requests to `/linear/webhook` for webhook events, returns 404 for other routes.
- **should-process-event.mjs** - Event filtering logic. Only processes Issue-type events in Todo or In Progress states. Ignores removed issues, issues created in Backlog/Done/Canceled, and metadata-only updates (comments, labels) when state hasn't changed. Returns null for events to ignore, or processed event object for events to act on.
- **trigger-issue-execution.mjs** - Triggers issue execution by calling the router's queue endpoint at `http://127.0.0.1:4319/v1/linear/trigger`. Prevents duplicate triggers by tracking active issues. Builds thread name from Linear issue identifier and title.
- **verify-signature.mjs** - HMAC-SHA256 signature verification using timing-safe comparison. Allows skipping verification for testing when no signature or secret is provided (with warnings logged).
- **webhook-secret.mjs** - Webhook secret from `LINEAR_WEBHOOK_SECRET` or `LINEAR_API_KEY` environment variable.
- **worktree-ids.mjs** - Worktree IDs configuration. Defaults to `1,2,3,4` via `LINEAR_WORKTREES` environment variable, parsed as comma-separated integers.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `runtime.mjs` provides a direct execution
path. The README content below is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/model/linear-webhook-receiver/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
