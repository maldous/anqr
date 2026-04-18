# ADR-0013 Shared Bridge State and Canonical Session Keys

- Status: Accepted
- Date: 2026-04-19

## Context

Prior to this ADR, the symphony bridge stored state in per-module directories under `reports/symphony/`. Each module (session-state, provider-health, credit-gate) independently resolved its state directory via `get-state-dir.mjs`, which checked `ANQR_SYMPHONY_STATE_DIR` then fell back to `reports/symphony/`.

This created several problems:

1. **Session identity instability**: The bridge used the `x-openclaw-session` header as the session key. Discord and Linear requests sent different header values for the same logical conversation, causing the bridge to create separate session records for what should be a single session. Provider stickiness and turn counting were lost across follow-up requests from the same channel or issue.

2. **No cross-worktree state visibility**: Each worktree ran the bridge in isolation. State files in `reports/symphony/` were local to that worktree's filesystem, so session state, provider health, and failure records were not shared across worktrees. A provider marked degraded in one worktree was still selected in another.

3. **Concurrent mutation data loss**: Session operations (`updateSessionProvider`, `setSessionMessages`, `clearSessionProvider`) performed read-modify-write without file-level locking. Under concurrent HTTP requests, the last writer would overwrite changes from the first, silently losing provider updates and message history.

4. **No source identity metadata**: Session records had no field indicating whether a session originated from Discord, Linear, or a header. This made it impossible to query "all Discord sessions" or "sessions for Linear issue ANQ-1234" without scanning all keys.

5. **Deadlock risk in save**: `saveSessionState` called `saveBridgeFile` with `{ withLock: true }`, but when the caller already held a lock via `withBridgeLock`, the nested lock acquisition deadlocked.

## Decision

### Canonical session key resolution

Introduce `resolveSessionKey` which deterministically maps request context to a stable session identity:

| Source                    | Key format                      | Example               |
| ------------------------- | ------------------------------- | --------------------- |
| Discord (guild + channel) | `discord:<guildId>:<channelId>` | `discord:12345:67890` |
| Discord (channel only)    | `discord:<channelId>`           | `discord:67890`       |
| Linear issue              | `linear:<issueIdentifier>`      | `linear:ANQ-1234`     |
| Header fallback           | `header:<value>`                | `header:sess-abc`     |

Priority: Discord > Linear > header fallback. This ensures the same Discord channel always maps to the same session key, regardless of the header value.

The bridge computes `canonicalSessionKey` after issue context extraction, then derives `effectiveSessionKey = canonicalSessionKey || sessionId`. All session operations use `effectiveSessionKey` instead of raw `sessionId`.

### Shared bridge state directory

All bridge state files are consolidated under a single directory resolved by `getBridgeStateDir`:

1. `ANQR_BRIDGE_STATE_DIR` env var (explicit override)
2. `ANQR_SYMPHONY_STATE_DIR` env var (reuse symphony state dir if set)
3. `$XDG_RUNTIME_DIR/anqr-bridge-state/` (user-local, shared across worktrees)
4. `/tmp/anqr-bridge-state/` (fallback)

The `XDG_RUNTIME_DIR` default ensures state is on a tmpfs (fast I/O) and scoped to the user (no cross-user leakage). All worktrees on the same machine share the same bridge state.

### File-level advisory locking

`withBridgeLock(fileName, fn)` acquires an O_EXCL lock file before running `fn`, then releases it. Uses exponential backoff with stale-detection (5s threshold). Matches the pattern from `durable-kv/with-store-lock.mjs`.

All read-modify-write session operations now wrap in `withBridgeLock`:

- `updateSessionProvider`
- `clearSessionProvider`
- `setSessionMessages`
- `clearSessionMessages`
- `getSessionProvider` (also deletes expired sessions)
- `cleanupExpiredSessions`
- `setSessionSource` (new)

### No nested locking in save

`saveSessionState` (and all `saveBridgeFile` callers inside `withBridgeLock`) no longer pass `{ withLock: true }`. The outer `withBridgeLock` already holds the lock; re-acquiring would deadlock. Atomic rename via `saveBridgeFile` provides crash safety without the lock.

### Source identity metadata

`setSessionSource(sessionId, source)` stamps `source: { type, discordGuildId?, discordChannelId?, linearIssueIdentifier? }` on session records. Called once at request entry after canonical key resolution. Source is preserved across provider switches and clear operations.

### Bridge file helpers

`loadBridgeFile` and `saveBridgeFile` provide consistent JSON I/O under the shared directory. `saveBridgeFile` uses write-to-temp-then-rename for crash safety and optionally acquires a lock.

## Consequences

- Same conversation always maps to the same session key, enabling reliable provider stickiness
- Bridge state is shared across worktrees on the same machine
- Concurrent session mutations are serialized under file locks, preventing data loss
- Source identity metadata enables querying sessions by origin
- No deadlock risk from nested locking
- `ANQR_BRIDGE_STATE_DIR` env var provides test isolation (each test gets its own directory)
