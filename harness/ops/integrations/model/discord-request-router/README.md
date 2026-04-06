# ANQR Discord Request Router

## 1. Directory Overview

This directory contains the Discord request routing system for the ANQR (Agentic Number Query
Runner) harness. It acts as a load-balancing proxy that routes incoming Discord requests to
appropriate worktree Symphony bridge instances, ensuring isolated execution contexts for each
concurrent request. It currently contains 22 files and 0 subdirectories.

## 2. File Summaries

### Files

- **evict-expired-sessions.mjs** - Periodically removes sessions older than the TTL (2 hours by default).
- **generate-thread-name.mjs** - Generates thread names from the last user message, truncating to 80 characters with a wrench emoji prefix (e.g., ``).
- **get-least-loaded-worktree.mjs** - Load balancing logic that finds the worktree with the minimum active requests. Uses round-robin among candidates with equal load to distribute requests evenly.
- **get-session-thread-name.mjs** - Retrieves or generates thread names for sessions. Triggers periodic eviction when cache exceeds 50 entries.
- **global-active-requests.mjs** - Global counter for active requests across all worktrees.
- **handle-health.mjs** - Health endpoint handler returning status, max concurrent, active requests, available slots, and worktree statuses.
- **index.mjs** - Re-exports all public API members for external consumption.
- **is-overloaded.mjs** - Checks if global active requests have reached the maximum concurrent limit.
- **is-path-within-root.mjs** - Utility to check if a path is within a given root directory using `path.relative`.
- **logger.mjs** - Shared logger using the project's logger library from `../../../lib/logger.mjs`.
- **max-concurrent.mjs** - Maximum concurrent requests (default: `4`, configurable via `MAX_CONCURRENT` environment variable).
- **port.mjs** - Port configuration (default: `18790`, configurable via `DISCORD_ROUTER_PORT` environment variable).
- **proxy-to-worktree.mjs** - Core proxy logic that forwards requests to worktree Symphony bridge instances. Rebases the working directory to the target worktree path, extracts Discord message IDs for thread functionality, generates thread names from user messages, and enforces isolation by warning when requests would write to the main repo.
- **rebase-cwd-to-worktree.mjs** - Rewrites the `cwd` field in request bodies to point to the target worktree instead of the main repo. Handles paths within the project root, worktree parent directories, and preserves valid worktree paths.
- **round-robin-index.mjs** - Round-robin state for load distribution among equally-loaded worktrees.
- **runtime.mjs** - Entry point that starts the HTTP server and logs startup information. Handles graceful shutdown via SIGTERM and SIGINT.
- **send-overload-response.mjs** - Returns HTTP 429 with retry guidance when system is overloaded.
- **server.mjs** - HTTP server that handles incoming requests. Routes POST requests to `/v1/chat/completions` to the least loaded worktree, returns 404 for other endpoints, and provides health/stats at `/health` and `/stats`.
- **session-thread-names.mjs** - In-memory Map storing session-to-thread-name mappings.
- **session-ttl-ms.mjs** - Session time-to-live (default: 2 hours).
- **worktree-ids.mjs** - Worktree IDs to use (default: `5,6,7,8`, configurable via `DISCORD_WORKTREES` environment variable).
- **worktree-urls.mjs** - Worktree URL mapping with paths, URLs, and active request counters. Each worktree maps to port `4320 + worktreeId`.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `runtime.mjs` provides a direct execution
path. The README content below is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/model/discord-request-router/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
