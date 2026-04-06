# ANQR Linear Webhook Receiver

## 1. Directory Overview

This directory contains the Linear Webhook Receiver for the ANQR (Agentic Number Query Runner) harness. It provides a webhook endpoint that receives events from Linear's issue tracking system and triggers execution on worktrees when issues move to actionable states (Todo or In Progress). The receiver acts as the bridge between Linear's event system and the Symphony orchestration engine.

## 2. File Summaries

### Core Handlers

- **handle-webhook.mjs** - Main webhook handling logic. Validates webhook signatures, checks for duplicates, parses events, detects Discord-sourced issues, and triggers execution on the least-loaded worktree. Returns appropriate HTTP status codes (200 for success, 503 if router unavailable, 500 for errors).

- **handle-health.mjs** - Health check endpoint handler. Returns JSON status including port, worktree IDs, and overall health status at `/health` or `/`.

- **should-process-event.mjs** - Event filtering logic. Only processes Issue-type events in Todo or In Progress states. Ignores removed issues, issues created in Backlog/Done/Canceled, and metadata-only updates (comments, labels) when state hasn't changed. Returns null for events to ignore, or processed event object for events to act on.

- **trigger-issue-execution.mjs** - Triggers issue execution by calling the router's queue endpoint at `http://127.0.0.1:4319/v1/linear/trigger`. Prevents duplicate triggers by tracking active issues. Builds thread name from Linear issue identifier and title.

### Configuration

- **port.mjs** - Port configuration. Defaults to `18791` via `LINEAR_WEBHOOK_PORT` environment variable.

- **webhook-secret.mjs** - Webhook secret from `LINEAR_WEBHOOK_SECRET` or `LINEAR_API_KEY` environment variable.

- **worktree-ids.mjs** - Worktree IDs configuration. Defaults to `1,2,3,4` via `LINEAR_WORKTREES` environment variable, parsed as comma-separated integers.

- **dedup-window-ms.mjs** - Deduplication window constant set to 60,000ms (1 minute).

### State Management

- **active-issues.mjs** - Set tracking issues currently being processed to prevent duplicate triggers.

- **recent-deliveries.mjs** - Set tracking recent delivery IDs for deduplication across webhook retries.

### Security

- **verify-signature.mjs** - HMAC-SHA256 signature verification using timing-safe comparison. Allows skipping verification for testing when no signature or secret is provided (with warnings logged).

### Server

- **server.mjs** - HTTP server creation using Node.js `http` module. Routes GET requests to `/health` or `/` for health checks, POST requests to `/linear/webhook` for webhook events, returns 404 for other routes.

- **index.mjs** - Facade index exporting all public API members including PORT, WEBHOOK_SECRET, WORKTREE_IDS, recentDeliveries, activeIssues, verifySignature, isDuplicate, shouldProcessEvent, triggerIssueExecution, handleHealth, handleWebhook, and server.

- **runtime.mjs** - Runtime entry point. Starts HTTP server on configured port, initializes deduplication cleanup interval (60s), active issues cleanup interval (5min), and handles SIGTERM/SIGINT for graceful shutdown.

### Utilities

- **logger.mjs** - Shared logger module using the project's logger library with logInfo, logWarn, logError, and logDebug exports.

- **is-duplicate.mjs** - Duplicate detection using recentDeliveries Set. Returns true and logs warning for duplicates, adds to Set and returns false for new delivery IDs.

## 3. Overall Directory Function

This directory implements the Linear webhook receiver that bridges Linear issue events to the ANQR orchestration system. The workflow: Linear sends webhook events to `/linear/webhook`, the receiver verifies the signature, checks for duplicates, filters events to only actionable ones (issues in Todo/In Progress), marks Discord-sourced issues, and triggers execution via the router endpoint.

Key features include:
- Signature verification for security
- Deduplication to handle webhook retries
- Active issue tracking to prevent duplicate processing
- Discord source detection for worktree routing
- Health endpoint for monitoring
- Graceful shutdown handling

The receiver routes issues to the least-loaded executor (wt1-4) based on router load balancing, enabling horizontal scaling of issue processing.

## 4. Usage Instructions

### Starting the Server

```bash
# Via facade (recommended)
node ops/integrations/model/linear-webhook-receiver/runtime.mjs
```

Or directly:

```bash
node ops/integrations/model/linear-webhook-receiver/runtime.mjs
```

### Configuration

Set environment variables before running:

```bash
# Port for webhook server (default: 18791)
export LINEAR_WEBHOOK_PORT=18791

# Webhook secret for signature verification
export LINEAR_WEBHOOK_SECRET=your_secret_here

# Worktree IDs to route to (default: 1,2,3,4)
export LINEAR_WORKTREES=1,2,3,4,5
```

### Endpoints

- `GET /health` - Health check returns JSON with status, port, and worktrees
- `POST /linear/webhook` - Webhook endpoint for Linear events

### Testing Webhook

```bash
# Send test webhook
curl -X POST http://127.0.0.1:18791/linear/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "Issue", "action": "create", "data": {"identifier": "TEST-123", "title": "Test Issue"}}'
```

## 5. Dependencies

### Internal Dependencies

- **../../../lib/logger.mjs** - Logger factory for logInfo, logWarn, logError, logDebug
- **../../../core/discord-source.mjs** - detectAndMarkDiscordSource function
- **../../linear/linear-client.mjs** - getIssueDetail for Discord source detection

### External Services

- **Linear** - Issue tracking platform that sends webhook events
- **Symphony Router** - Running at http://127.0.0.1:4319 for trigger endpoint

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Network access to Linear API and Symphony router
- Valid webhook secret for production use

## 6. Additional Comments

- **Fail-Open Testing**: Signature verification is skipped when no signature or secret is provided, enabling local testing. This should not be used in production.

- **State-Based Routing**: Only triggers execution when issues move TO Todo or In Progress. Metadata-only updates (comments, labels) don't trigger new execution since the executor already has the issue in its queue.

- **Active Issue Tracking**: Prevents duplicate triggers by marking issues as active when processing begins. Issues remain marked until execution completes (tracked externally by the executor).

- **Deduplication**: Uses Linear's delivery ID header to detect and skip duplicate webhook deliveries within a 60-second window.

- **Graceful Shutdown**: Clears active issues on SIGTERM/SIGINT to prevent stale state after restart.

- **Router Integration**: Sends minimal trigger payload to router's `/v1/linear/trigger` endpoint; the executor fetches full issue details.

- **Thread Naming**: Builds thread name as `${identifier}: ${title}` for clear identification in execution logs.