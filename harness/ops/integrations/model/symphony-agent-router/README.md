# ANQR Symphony Agent Router

## 1. Directory Overview

This directory contains the Symphony Agent Router, which serves as the central routing layer for the ANQR (Agentic Number Query Runner) harness. The router distributes incoming AI requests across multiple git worktrees, handles Linear webhook triggers, manages request queueing, and enforces concurrent request limits. It acts as a proxy/load balancer that intelligently routes traffic to available worktree bridge instances based on load and availability.

## 2. File Summaries

### Configuration Files

- **port.mjs** - Exports the PORT constant, defaulting to 4319 or the value of SYMPHONY_AGENT_PORT or SYMPHONY_BRIDGE_PORT environment variables.

- **target-host.mjs** - Exports TARGET_HOST constant, defaulting to "127.0.0.1" or the SYMPHONY_AGENT_TARGET_HOST environment variable.

- **worktree-ids.mjs** - Exports WORKTREE_IDS array parsed from SYMPHONY_AGENT_WORKTREES environment variable (defaults to "1,2,3,4,5,6,7,8").

- **max-concurrent.mjs** - Exports MAX_CONCURRENT constant from SYMPHONY_AGENT_MAX_CONCURRENT env var, defaulting to 8.

- **max-queue-length.mjs** - Exports MAX_QUEUE_LENGTH constant set to 50.

- **max-queue-age-ms.mjs** - Exports MAX_QUEUE_AGE_MS constant set to 5 minutes (300,000ms).

- **queue-poll-interval-ms.mjs** - Exports QUEUE_POLL_INTERVAL_MS constant set to 5000ms.

### State Management

- **worktrees.mjs** - Exports WORKTREES array, mapping WORKTREE_IDS to worktree objects with id, path, port (4320+id), activeRequests, and failures properties.

- **global-active-requests.mjs** - Exports mutable globalActiveRequests counter and setGlobalActiveRequests function for tracking total concurrent requests.

- **linear-queue.mjs** - Exports the linearQueue array for storing pending Linear trigger events.

- **round-robin-index.mjs** - Exports roundRobinIndex state and setRoundRobinIndex function for load distribution.

### Request Handling

- **select-worktree.mjs** - Exports selectWorktree function that routes requests to worktrees based on: explicit x-worktree-id header or worktreeId/worktree_id in body, then least-loaded worktree (activeRequests then failures), with round-robin for ties.

- **proxy-request.mjs** - Exports proxyRequest function that proxies HTTP requests to the target worktree, rewrites body with worktreeId/worktreePath, manages active request counters, handles timeouts (30 min), and tracks failures.

- **handle-linear-trigger.mjs** - Exports handleLinearTrigger function for POST /v1/linear/trigger endpoint. Routes Linear webhook triggers to available worktrees (wt1-4), queues triggers if all worktrees busy, handles max queue length.

- **handle-linear-queue.mjs** - Exports handleLinearQueue function handling GET/POST/DELETE /v1/linear/queue for queue status management and manual queue operations.

- **spawn-linear-runner.mjs** - Exports spawnLinearRunner function that spawns a symphony-runner process in the target worktree for Linear issue processing.

### Utility Functions

- **is-path-within-root.mjs** - Exports isPathWithinRoot function to check if a path is within a root directory using path.relative logic.

- **rebase-cwd-to-worktree.mjs** - Exports rebaseCwdToWorktree function that rebases the current working directory to the appropriate location in the target worktree, handling paths within project root or project parent directories.

- **json.mjs** - Exports json helper function for sending JSON responses with proper status codes and headers.

- **overload.mjs** - Exports overload function that sends a 429 "Symphony agent is at concurrent capacity" response.

- **logger.mjs** - Exports logInfo, logWarn, logError, logDebug functions using the shared logger from lib/logger.mjs.

### Server & Runtime

- **server.mjs** - Exports the HTTP server instance handling: GET /, /health, /stats for status; GET /v1/models for model listing; POST /v1/chat/completions and /chat/completions for proxying; /v1/linear/trigger and /v1/linear/queue for Linear integration.

- **runtime.mjs** - Runtime carry-forward that sets up a queue processing interval (QUEUE_POLL_INTERVAL_MS) to drain stale items and process queued Linear triggers. Starts the server and handles SIGTERM/SIGINT graceful shutdown.

- **index.mjs** - Generated facade index exporting all public API members from the various modules.

## 3. Overall Directory Function

The Symphony Agent Router functions as the entry point for AI requests in the ANQR harness. It receives incoming requests (primarily /v1/chat/completions) and intelligently routes them to available worktree bridge instances.

Key functionality:

- **Load Balancing**: Routes requests to the least-loaded worktree, using round-robin for equally-loaded candidates. Considers both active requests and failure counts.

- **Concurrency Control**: Enforces MAX_CONCURRENT global limit, returning 429 when exceeded. Tracks per-worktree and global active requests.

- **Queue Management**: Maintains a Linear trigger queue when all worktrees are busy. Drops stale items older than MAX_QUEUE_AGE_MS. Processes queued items as worktrees become available.

- **Linear Integration**: Special handling for Linear webhook triggers via /v1/linear/trigger and queue management via /v1/linear/queue. Only routes Linear triggers to worktrees wt1-4.

- **Path Rebasing**: Rewrites the cwd in request bodies to point to the correct location within the target worktree, enabling proper file operations.

- **Metrics**: Exposes /stats endpoint showing active requests, queue length, and per-worktree status.

The router is critical for horizontal scaling - multiple worktrees can process requests concurrently, with the router distributing load intelligently.

## 4. Usage Instructions

### Starting the Router

```bash
node ops/integrations/model/symphony-agent-router/runtime.mjs
```

Or via the facade:

```bash
node ops/integrations/model/symphony-agent-router.mjs
```

### Environment Variables

- `SYMPHONY_AGENT_PORT` - Server port (default: 4319)
- `SYMPHONY_AGENT_TARGET_HOST` - Target hostname for worktree bridges (default: 127.0.0.1)
- `SYMPHONY_AGENT_WORKTREES` - Comma-separated worktree IDs (default: "1,2,3,4,5,6,7,8")
- `SYMPHONY_AGENT_MAX_CONCURRENT` - Max concurrent requests (default: 8)

### API Endpoints

- `GET /` or `GET /health` - Health check with worktree status
- `GET /stats` - Detailed statistics including active requests and queue length
- `POST /v1/chat/completions` - Proxy chat completion to selected worktree
- `POST /v1/linear/trigger` - Trigger Linear issue processing
- `GET /v1/linear/queue` - Get queue status
- `DELETE /v1/linear/queue` - Clear the queue

### Request Routing

The router selects worktrees based on:

1. Explicit `x-worktree-id` header or `worktreeId`/`worktree_id` in request body
2. Least-loaded worktree (by activeRequests, then failures)
3. Round-robin among tied worktrees

For Linear triggers, only worktrees wt1-wt4 are considered.

## 5. Dependencies

### Internal Dependencies

- **../../../core/worktree-config.mjs** - For getWorktreePath function and PROJECT_ROOT constant
- **../../../lib/logger.mjs** - For createLogger factory
- **harness/ops/orchestration/symphony-runner.mjs** - Spawned for Linear issue processing

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Running worktree bridge instances on ports 4321-4328 (for worktrees 1-8)
- Valid git worktrees configured and accessible

### External Services

- **Linear** - Webhook triggers processed through the router
- **Worktree Bridges** - HTTP servers running in each worktree that handle actual AI requests

## 6. Additional Comments

- **Timeout Handling**: Proxy requests have a 30-minute timeout. On timeout or error, the failure count for that worktree is incremented, influencing future routing decisions.

- **Queue TTL**: Stale items in the Linear queue older than 5 minutes are automatically dropped to prevent memory buildup.

- **Linear Worktrees**: Only worktrees 1-4 are used for Linear trigger processing, as defined in the spawnLinearRunner and handleLinearTrigger functions.

- **Graceful Shutdown**: Server handles SIGTERM and SIGINT to close cleanly.

- **Request Body Rewrite**: The router rewrites the cwd in request bodies to point to the target worktree's path, enabling the downstream bridge to operate in the correct working directory.

- **Active Request Tracking**: Both per-worktree and global active request counters are maintained to enforce concurrency limits and provide metrics.