# Discord to Worktree Routing Architecture

> **Primary reference:** [12-concurrent-execution-with-worktrees.md](12-concurrent-execution-with-worktrees.md) — comprehensive worktree documentation with gap analysis.

## Overview

Discord requests flow through a **single OpenClaw Gateway instance** which provides the Discord bot relay. OpenClaw uses Symphony Bridge for AI processing, routing through the Discord Request Router to isolated worktrees (wt5-wt8).

**Current status (2026-04-02):** All Discord services **OPERATIONAL**. All config conflicts resolved. All 8 phases of validation complete. Round-robin routing and automatic git sync/push enabled. See primary doc for evidence.

## OpenClaw's Role

OpenClaw is a **third-party CLI/gateway** that:

1. Connects to Discord as a bot (receives user messages)
2. Forwards messages as `/v1/chat/completions` requests to configured AI providers
3. Provides tool execution framework (read, write, exec, search)
4. Returns AI responses to Discord

**OpenClaw does NOT contain AI models.** It delegates to Symphony Bridge for AI processing.

## Architecture (ADR-0003: All-in-One Symphony Bridge)

```
Discord Bot (OpenClaw Gateway, port 18789)    ← standalone service
       ↓ uses symphony-bridge provider
Discord Request Router (port 18790)           ← Load balancer
       ↓ least-loaded selection
Symphony Executors (ports 4325-4328)          ← Per-worktree isolation
       ↓ AI + Codebuff SDK + tools in one service
       ↓ WorkingDirectory = worktree path (single source of truth)
Provider Cascade → LLM API
       ↓
Git Worktrees (wt5-wt8)
```

**Key change (2026-03-31):** Symphony bridges now provide all capabilities:

- AI completion (`/v1/chat/completions`)
- Codebuff SDK operations (integrated, not separate service)
- Tool execution (file ops, git, etc.)

This eliminates the separate Codebuff bridge service and caching defects. See `docs/adrs/0003-all-in-one-symphony-bridge.md`.

## Components

### 1. OpenClaw Gateway (Standalone Service)

- **Port:** 18789
- **Service:** `openclaw-gateway.service` (standalone, managed by systemd)
- Single gateway process with `Restart=always` for crash recovery
- Discord channel access controlled via `channels.discord.guilds` allowlist in `~/.openclaw/openclaw.json`

**Config files (3 locations with merge behavior):**

| Config                              | symphony-bridge URL         | Notes                      |
| ----------------------------------- | --------------------------- | -------------------------- |
| `~/.openclaw/openclaw.json`         | `http://127.0.0.1:18790/v1` | Global config              |
| `.openclaw/openclaw.json` (in-repo) | `http://127.0.0.1:18790/v1` | Project config             |
| `.openclaw/models.json` (in-repo)   | `http://127.0.0.1:18790/v1` | ✅ Updated to match router |

### 2. Discord Request Router

- **Port:** 18790
- **Service:** `anqr-discord-router.service`
- **Implementation:** `harness/ops/integrations/model/discord-request-router.mjs`
- Least-loaded worktree selection with **round-robin** among equally-loaded worktrees
- Rebases `cwd` in request payload to target worktree path
- Returns 429 when all 4 worktrees at capacity

### 3. Worktree Symphony Executors

| Worktree | Port | Directory                 |
| -------- | ---- | ------------------------- |
| wt5      | 4325 | `/home/user/src/anqr-wt5` |
| wt6      | 4326 | `/home/user/src/anqr-wt6` |
| wt7      | 4327 | `/home/user/src/anqr-wt7` |
| wt8      | 4328 | `/home/user/src/anqr-wt8` |

- **Service:** `anqr-symphony-executor@{5,6,7,8}.service`
- **Capabilities:** AI completion + Codebuff SDK + tool execution (all integrated)
- Each runs in its own worktree directory via `WorkingDirectory`
- ExecStart uses main repo script path; cwd is the worktree
- Full provider cascade (same as main bridge)
- **No separate Codebuff bridge needed** (integrated per ADR-0003)

## Request Flow (Simplified with All-in-One Bridge)

1. **Discord user sends message** → OpenClaw Gateway (port 18789)
2. **Gateway forwards to provider:** `POST http://127.0.0.1:18790/v1/chat/completions` (via symphony-bridge config)
3. **Router selects worktree:** Round-robin among least-loaded of wt5-wt8
4. **Router proxies to bridge:** `POST http://127.0.0.1:432{i}/v1/chat/completions` with `X-Worktree-ID: wt{i}`
5. **Bridge syncs worktree:** `syncWorktreeFromMain()` — fetches and merges `origin/main` (non-fatal on failure)
6. **Bridge executes in worktree:**
   - AI completion via provider cascade
   - Codebuff SDK operations (integrated)
   - Tool execution (file ops, git, etc.)
   - All scoped to `/home/user/src/anqr-wt{i}` via `WorkingDirectory`
7. **Bridge pushes changes:** `pushWorktreeToMain()` — commits and pushes to `origin/main` (with retry/rebase)
8. **Response streams back:** Bridge → Router → Gateway → Discord

**Note:** No cwd rewriting needed — systemd `WorkingDirectory` ensures correct working directory from process start.

## Git Sync/Push (Automatic)

As of 2026-04-02, the Symphony bridge automatically syncs and pushes git changes:

- **Before each request:** `syncWorktreeFromMain()` fetches `origin/main` and merges (ff-only first, regular merge fallback, abort on conflict)
- **After each completion:** `pushWorktreeToMain()` stages, commits, and pushes to `origin/main` (up to 3 retries with rebase)
- Both are non-fatal — failures log warnings but don't block request processing
- This ensures all worktrees stay up to date and share their work automatically

## Resolved Defects (External Review 2026-03-31)

The following defects were identified by external code review:

- **F1: Codebuff client cwd caching** — Retired standalone Codebuff bridge cached shared client by `costMode` only, ignoring `cwd`. **Resolution:** ADR-0003 — Codebuff SDK integrated into each worktree-local Symphony executor (no shared client state).
- **F2: Control script scope** — Fixed to enable only runner timers 1-4.
- **F3: Bridge auto-start** — Auto-start of runner timers removed from executor startup.

See `docs/harness/12-concurrent-execution-with-worktrees.md` Section 4A for full evidence.

## Resolved Issues (All Verified)

All issues identified by external review have been resolved and verified through Phases 1-7:

### Issue 1: `models.json` Provider URL — ✅ RESOLVED (Phase 3)

`models.json` was updated to point to `http://127.0.0.1:18790/v1` (the router). Verified via `openclaw config get` that `openclaw.json` wins the merge chain. Both config files now agree on the router URL.

### Issue 2: Workspace Config — ✅ VERIFIED SAFE (Phase 3)

Verified that the bridge ignores the `workspace` field. The Discord Router rebases `cwd` to the target worktree path. Not a runtime isolation issue.

**All isolation layers verified:**

| Layer                                                 | Status               | Notes                                             |
| ----------------------------------------------------- | -------------------- | ------------------------------------------------- |
| 1. Provider URL routing (to router, not main bridge)  | ✅ **VERIFIED**      | `models.json` updated; `openclaw.json` wins merge |
| 2. Systemd `WorkingDirectory` (bridge cwd = worktree) | ✅ Implemented       | Verified Phase 4                                  |
| 3. Router cwd rebase (rewrites request paths)         | ✅ Implemented       | Verified Phase 5                                  |
| 4. OpenClaw workspace (anchors tool ops)              | ✅ **VERIFIED SAFE** | Bridge ignores workspace; router rebases cwd      |

### Issue 3: Gateway Architecture — ✅ RESOLVED

`openclaw-gateway.service` is now the canonical standalone gateway service. The old timer-based singleton pattern (`anqr-discord-bridge@{5,6,7,8}.timer`) has been retired.

## Monitoring

```bash
# Router health
curl http://127.0.0.1:18790/health | jq

# Executor health
for i in 5 6 7 8; do curl -s http://127.0.0.1:432$i/health | jq '.status'; done

# Service status
systemctl --user status anqr-discord-router.service
systemctl --user status anqr-symphony-executor@{5,6,7,8}.service
systemctl --user status openclaw-gateway.service
```

## Deployment

```bash
# Deploy services
cp services/systemd/anqr-symphony-executor@.service ~/.config/systemd/user/
cp services/systemd/anqr-discord-router.service ~/.config/systemd/user/
systemctl --user daemon-reload

# Enable executors (wt5-wt8 for Discord)
systemctl --user enable --now anqr-symphony-executor@{5,6,7,8}.service
systemctl --user enable --now anqr-discord-router.service

# OpenClaw gateway is managed separately
systemctl --user enable --now openclaw-gateway.service
```

## Related Files

- `harness/ops/integrations/model/discord-request-router.mjs` — Router implementation
- `harness/ops/integrations/model/symphony-openai-bridge.mjs` — Executor bridge implementation
- `~/.openclaw/openclaw.json` — OpenClaw config (models, gateway, Discord guilds allowlist)
- `.openclaw/models.json` — In-repo model provider overrides (✅ updated to match router URL)
- `services/systemd/anqr-discord-router.service` — Router service
- `services/systemd/anqr-symphony-executor@.service` — Executor template

---

**Last Updated:** 2026-04-02
