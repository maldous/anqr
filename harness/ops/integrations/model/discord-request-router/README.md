# Discord Request Router

## Purpose
Directory for OpenClaw gateway/runtime configuration; immediate files include `evict-expired-sessions.mjs`, `generate-thread-name.mjs`, `get-least-loaded-worktree.mjs`, `get-session-thread-name.mjs`, and others.

## Contents
- 25 immediate files
- 0 child directories

## Key Files
- `evict-expired-sessions.mjs` - Exports `evictExpiredSessions`, the main helper defined in this file.
- `generate-thread-name.mjs` - Exports `generateThreadName`, the main helper defined in this file.
- `get-least-loaded-worktree.mjs` - Exports `getLeastLoadedWorktree`, the main helper defined in this file.
- `get-session-thread-name.mjs` - Exports `getSessionThreadName`, the main helper defined in this file.
- `global-active-requests.mjs` - Exports `setGlobalActiveRequests`, the main helper defined in this file.
- `handle-health.mjs` - Exports `handleHealth`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-openclaw-directive-body.mjs` - Exports `isOpenClawDirectiveBody`, the main helper defined in this file.
- `is-overloaded.mjs` - Exports `isOverloaded`, the main helper defined in this file.
- `is-path-within-root.mjs` - Exports `isPathWithinRoot`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `max-concurrent.mjs` - Exports `MAX_CONCURRENT`, a shared constant or state value used by sibling modules.
- `port.mjs` - Exports `PORT`, a shared constant or state value used by sibling modules.
- `process-and-proxy.mjs` - Exports `processAndProxy`, the main helper defined in this file.
- `proxy-to-worktree.mjs` - Exports `proxyToWorktree`, the main helper defined in this file.
- `rebase-cwd-to-worktree.mjs` - Exports `rebaseCwdToWorktree`, the main helper defined in this file.
- `round-robin-index.mjs` - Exports `setRoundRobinIndex`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `send-directive-ack.mjs` - Exports `sendDirectiveAck`, the main helper defined in this file.
- `send-overload-response.mjs` - Exports `sendOverloadResponse`, the main helper defined in this file.
- `server.mjs` - Exports `server`, a shared constant or state value used by sibling modules.
- `session-thread-names.mjs` - Exports `sessionThreadNames`, a shared constant or state value used by sibling modules.
- `session-ttl-ms.mjs` - Exports `SESSION_TTL_MS`, a shared constant or state value used by sibling modules.
- `worktree-ids.mjs` - Exports `WORKTREE_IDS`, a shared constant or state value used by sibling modules.
- `worktree-urls.mjs` - Exports `WORKTREE_URLS`, a shared constant or state value used by sibling modules.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 25 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
