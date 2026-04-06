# ANQR Discord Request Router

## 1. Directory Overview

This directory implements **ANQR Discord Request Router** within the ANQR harness. The immediate code includes a standalone runtime entry point alongside helper modules. The current inventory is 22 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **evict-expired-sessions.mjs** - Exports `evictExpiredSessions`, which implements evict expired sessions.
- **generate-thread-name.mjs** - Exports `generateThreadName`, which implements generate thread name.
- **get-least-loaded-worktree.mjs** - Exports `getLeastLoadedWorktree`, which gets least loaded worktree.
- **get-session-thread-name.mjs** - Exports `getSessionThreadName`, which gets session thread name.
- **global-active-requests.mjs** - Exports `globalActiveRequests`, `setGlobalActiveRequests`, providing the reusable API for this directory concern.
- **handle-health.mjs** - Exports `handleHealth`, which implements handle health.
- **index.mjs** - Facade module that re-exports public members from `./port.mjs`, `./worktree-ids.mjs`, `./max-concurrent.mjs`, `./worktree-urls.mjs`, `./global-active-requests.mjs`, `./session-thread-names.mjs`, and 13 more siblings.
- **is-overloaded.mjs** - Exports `isOverloaded`, which checks whether overloaded.
- **is-path-within-root.mjs** - Exports `isPathWithinRoot`, which checks whether path within root.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **max-concurrent.mjs** - Exports `MAX_CONCURRENT`, a shared constant used by sibling modules.
- **port.mjs** - Exports `PORT`, a shared constant used by sibling modules.
- **proxy-to-worktree.mjs** - Exports `proxyToWorktree`, which implements proxy to worktree.
- **rebase-cwd-to-worktree.mjs** - Exports `rebaseCwdToWorktree`, which implements rebase cwd to worktree.
- **round-robin-index.mjs** - Exports `roundRobinIndex`, `setRoundRobinIndex`, providing the reusable API for this directory concern.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **send-overload-response.mjs** - Exports `sendOverloadResponse`, which implements send overload response.
- **server.mjs** - Exports `server`, which implements server.
- **session-thread-names.mjs** - Exports `sessionThreadNames`, which implements session thread names.
- **session-ttl-ms.mjs** - Exports `SESSION_TTL_MS`, a shared constant used by sibling modules.
- **worktree-ids.mjs** - Exports `WORKTREE_IDS`, a shared constant used by sibling modules.
- **worktree-urls.mjs** - Exports `WORKTREE_URLS`, a shared constant used by sibling modules.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include network/API integration, timer, scheduling, cooldown, or watchdog behavior, Discord integration, OpenClaw integration, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/integrations/model/discord-request-router/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:http`, `node:path`
- **Internal relative modules** - `../../../core/worktree-config.mjs`, `../../../lib/logger.mjs`, `./evict-expired-sessions.mjs`, `./generate-thread-name.mjs`, `./get-least-loaded-worktree.mjs`, `./get-session-thread-name.mjs`, `./global-active-requests.mjs`, `./handle-health.mjs`, `./index.mjs`, `./is-overloaded.mjs`, `./is-path-within-root.mjs`, `./logger.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
