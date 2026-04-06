# ANQR Discord Request Router

## 1. Directory Overview

This directory contains the Discord request routing system for the ANQR (Agentic Number Query Runner) harness. It acts as a load-balancing proxy that routes incoming Discord requests to appropriate worktree Symphony bridge instances, ensuring isolated execution contexts for each concurrent request.

The router enforces critical isolation boundaries, manages concurrency limits, and provides health monitoring for the distributed worktree infrastructure.

## 2. File Summaries

### Core Routing

- **server.mjs** - HTTP server that handles incoming requests. Routes POST requests to `/v1/chat/completions` to the least loaded worktree, returns 404 for other endpoints, and provides health/stats at `/health` and `/stats`.

- **proxy-to-worktree.mjs** - Core proxy logic that forwards requests to worktree Symphony bridge instances. Rebases the working directory to the target worktree path, extracts Discord message IDs for thread functionality, generates thread names from user messages, and enforces isolation by warning when requests would write to the main repo.

- **get-least-loaded-worktree.mjs** - Load balancing logic that finds the worktree with the minimum active requests. Uses round-robin among candidates with equal load to distribute requests evenly.

### Configuration

- **port.mjs** - Port configuration (default: `18790`, configurable via `DISCORD_ROUTER_PORT` environment variable).

- **worktree-ids.mjs** - Worktree IDs to use (default: `5,6,7,8`, configurable via `DISCORD_WORKTREES` environment variable).

- **worktree-urls.mjs** - Worktree URL mapping with paths, URLs, and active request counters. Each worktree maps to port `4320 + worktreeId`.

- **max-concurrent.mjs** - Maximum concurrent requests (default: `4`, configurable via `MAX_CONCURRENT` environment variable).

### Session Management

- **session-thread-names.mjs** - In-memory Map storing session-to-thread-name mappings.

- **get-session-thread-name.mjs** - Retrieves or generates thread names for sessions. Triggers periodic eviction when cache exceeds 50 entries.

- **generate-thread-name.mjs** - Generates thread names from the last user message, truncating to 80 characters with a wrench emoji prefix (e.g., ``).

- **evict-expired-sessions.mjs** - Periodically removes sessions older than the TTL (2 hours by default).

- **session-ttl-ms.mjs** - Session time-to-live (default: 2 hours).

### Request Tracking

- **global-active-requests.mjs** - Global counter for active requests across all worktrees.

- **round-robin-index.mjs** - Round-robin state for load distribution among equally-loaded worktrees.

- **is-overloaded.mjs** - Checks if global active requests have reached the maximum concurrent limit.

- **send-overload-response.mjs** - Returns HTTP 429 with retry guidance when system is overloaded.

### Path Utilities

- **rebase-cwd-to-worktree.mjs** - Rewrites the `cwd` field in request bodies to point to the target worktree instead of the main repo. Handles paths within the project root, worktree parent directories, and preserves valid worktree paths.

- **is-path-within-root.mjs** - Utility to check if a path is within a given root directory using `path.relative`.

### Health & Logging

- **handle-health.mjs** - Health endpoint handler returning status, max concurrent, active requests, available slots, and worktree statuses.

- **logger.mjs** - Shared logger using the project's logger library from `../../../lib/logger.mjs`.

### Runtime

- **runtime.mjs** - Entry point that starts the HTTP server and logs startup information. Handles graceful shutdown via SIGTERM and SIGINT.

### Facade Index

- **index.mjs** - Re-exports all public API members for external consumption.

## 3. Overall Directory Function

This directory implements a critical isolation boundary in the ANQR system. The Discord request router receives chat completion requests from Discord and intelligently routes them to isolated worktree Symphony bridge instances.

**Request Flow:**

1. Discord sends a request to the router's port (default 18790)
2. Server checks if overloaded (returns 429 if at max concurrent)
3. Load balancer finds the worktree with fewest active requests
4. Proxy rewrites the `cwd` to point to the target worktree
5. Request is forwarded to `http://127.0.0.1:432{worktreeId}/v1/chat/completions`
6. Response is streamed back to the Discord client

**Key Design Decisions:**

- **Isolation**: Requests cannot write to the main repo - `cwd` is always rebased to a worktree
- **Concurrency Control**: Global limit prevents system overload (default: 4 concurrent)
- **Load Balancing**: Least-loaded selection with round-robin tiebreaking ensures even distribution
- **Thread Naming**: User messages generate descriptive thread names for conversation tracking
- **Graceful Degradation**: Overloaded requests receive 429 with retry guidance

## 4. Usage Instructions

### Starting the Router

```bash
node ops/integrations/model/discord-request-router/runtime.mjs
```

Or via the facade:

```bash
node ops/integrations/model/discord-request-router.mjs
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DISCORD_ROUTER_PORT` | `18790` | HTTP server port |
| `DISCORD_WORKTREES` | `5,6,7,8` | Comma-separated worktree IDs |
| `MAX_CONCURRENT` | `4` | Maximum concurrent requests |

### Endpoints

- `GET /health` - Health check with system status
- `GET /stats` - Same as health (alias)
- `POST /v1/chat/completions` - Proxy to least loaded worktree

### Health Response Example

```json
{
  "status": "ok",
  "maxConcurrent": 4,
  "activeRequests": 2,
  "availableSlots": 2,
  "worktrees": [
    { "id": 5, "path": "/home/user/src/anqr/anqr-wt5", "url": "http://127.0.0.1:4325", "activeRequests": 1, "healthy": true }
  ]
}
```

## 5. Dependencies

### Internal Dependencies

- **../../../lib/logger.mjs** - Logging utility
- **../../../core/worktree-config.mjs** - Worktree path resolution (`getWorktreePath`, `PROJECT_ROOT`)

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Worktree Symphony bridges running on ports 4325, 4326, 4327, 4328 (for default worktrees 5-8)
- All target worktrees must have their Symphony bridges operational

## 6. Additional Comments

- **Port Mapping**: Worktree IDs are mapped to ports as `4320 + worktreeId`. So wt5 -> 4325, wt6 -> 4326, etc.

- **Isolation Violation Detection**: The router logs an error (`ISOLATION VIOLATION`) if a request's `cwd` would resolve to the main repo, preventing unintended main repo modifications.

- **Request Timeout**: Both incoming requests and proxy requests have a 2-minute timeout to prevent hanging connections.

- **Thread Name Generation**: Thread names use the last user message content, truncated to 80 characters with newlines replaced by spaces. This helps Discord users identify conversation threads.

- **Session-Based Threading**: Thread names are cached per session (via `x-openclaw-session` header) to maintain consistent thread naming across multiple requests in the same conversation.

- **Graceful Shutdown**: The server handles SIGTERM and SIGINT for clean shutdown, ensuring in-flight requests can complete.