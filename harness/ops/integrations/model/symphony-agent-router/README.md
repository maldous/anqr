# ANQR Symphony Agent Router

## 1. Directory Overview

This directory contains the Symphony Agent Router, which serves as the central routing layer for the
ANQR (Agentic Number Query Runner) harness. The router distributes incoming AI requests across
multiple git worktrees, handles Linear webhook triggers, manages request queueing, and enforces
concurrent request limits. It acts as a proxy/load balancer that intelligently routes traffic to
available worktree bridge instances based on load and availability. It currently contains 24 files
and 0 subdirectories.

## 2. File Summaries

### Files

- **global-active-requests.mjs** - Exports mutable globalActiveRequests counter and setGlobalActiveRequests function for tracking total concurrent requests.
- **handle-linear-queue.mjs** - Exports handleLinearQueue function handling GET/POST/DELETE /v1/linear/queue for queue status management and manual queue operations.
- **handle-linear-trigger.mjs** - Exports handleLinearTrigger function for POST /v1/linear/trigger endpoint. Routes Linear webhook triggers to available worktrees (wt1-4), queues triggers if all worktrees busy, handles max queue length.
- **index.mjs** - Generated facade index exporting all public API members from the various modules.
- **is-path-within-root.mjs** - Exports isPathWithinRoot function to check if a path is within a root directory using path.relative logic.
- **json.mjs** - Exports json helper function for sending JSON responses with proper status codes and headers.
- **linear-queue.mjs** - Exports the linearQueue array for storing pending Linear trigger events.
- **logger.mjs** - Exports logInfo, logWarn, logError, logDebug functions using the shared logger from lib/logger.mjs.
- **max-concurrent.mjs** - Exports MAX_CONCURRENT constant from SYMPHONY_AGENT_MAX_CONCURRENT env var, defaulting to 8.
- **max-queue-age-ms.mjs** - Exports MAX_QUEUE_AGE_MS constant set to 5 minutes (300,000ms).
- **max-queue-length.mjs** - Exports MAX_QUEUE_LENGTH constant set to 50.
- **overload.mjs** - Exports overload function that sends a 429 "Symphony agent is at concurrent capacity" response.
- **port.mjs** - Exports the PORT constant, defaulting to 4319 or the value of SYMPHONY_AGENT_PORT or SYMPHONY_BRIDGE_PORT environment variables.
- **proxy-request.mjs** - Exports proxyRequest function that proxies HTTP requests to the target worktree, rewrites body with worktreeId/worktreePath, manages active request counters, handles timeouts (30 min), and tracks failures.
- **queue-poll-interval-ms.mjs** - Exports QUEUE_POLL_INTERVAL_MS constant set to 5000ms.
- **rebase-cwd-to-worktree.mjs** - Exports rebaseCwdToWorktree function that rebases the current working directory to the appropriate location in the target worktree, handling paths within project root or project parent directories.
- **round-robin-index.mjs** - Exports roundRobinIndex state and setRoundRobinIndex function for load distribution.
- **runtime.mjs** - Runtime carry-forward that sets up a queue processing interval (QUEUE_POLL_INTERVAL_MS) to drain stale items and process queued Linear triggers. Starts the server and handles SIGTERM/SIGINT graceful shutdown.
- **select-worktree.mjs** - Exports selectWorktree function that routes requests to worktrees based on: explicit x-worktree-id header or worktreeId/worktree_id in body, then least-loaded worktree (activeRequests then failures), with round-robin for ties.
- **server.mjs** - Exports the HTTP server instance handling: GET /, /health, /stats for status; GET /v1/models for model listing; POST /v1/chat/completions and /chat/completions for proxying; /v1/linear/trigger and /v1/linear/queue for Linear integration.
- **spawn-linear-runner.mjs** - Exports spawnLinearRunner function that spawns a symphony-runner process in the target worktree for Linear issue processing.
- **target-host.mjs** - Exports TARGET_HOST constant, defaulting to "127.0.0.1" or the SYMPHONY_AGENT_TARGET_HOST environment variable.
- **worktree-ids.mjs** - Exports WORKTREE_IDS array parsed from SYMPHONY_AGENT_WORKTREES environment variable (defaults to "1,2,3,4,5,6,7,8").
- **worktrees.mjs** - Exports WORKTREES array, mapping WORKTREE_IDS to worktree objects with id, path, port (4320+id), activeRequests, and failures properties.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `runtime.mjs` provides a direct execution
path. The README content below is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/model/symphony-agent-router/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
