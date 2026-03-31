# Discord to Worktree Routing Architecture

> **Primary reference:** [12-concurrent-execution-with-worktrees.md](12-concurrent-execution-with-worktrees.md) — comprehensive worktree documentation with gap analysis.

## Overview

Discord requests flow through a **single OpenClaw Gateway instance** which provides the Discord bot relay. OpenClaw uses Symphony Bridge for AI processing, routing through the Discord Request Router to isolated worktrees (wt5-wt8).

**Current status (2026-03-31):** All Discord services STOPPED. Critical config conflicts identified. See primary doc for full gap analysis, phased delivery plan (Section 17), E2E testing strategy (Section 18), and reviewer briefing (Section 19).

## OpenClaw's Role

OpenClaw is a **third-party CLI/gateway** that:

1. Connects to Discord as a bot (receives user messages)
2. Forwards messages as `/v1/chat/completions` requests to configured AI providers
3. Provides tool execution framework (read, write, exec, search)
4. Returns AI responses to Discord

**OpenClaw does NOT contain AI models.** It delegates to Symphony Bridge for AI processing.

## Architecture

```
Discord Bot (OpenClaw Gateway, port 18789)   ← ONE singleton instance
       ↓ uses symphony-bridge provider
Discord Request Router (port 18790)          ← Load balancer
       ↓ least-loaded selection + cwd rebase
Worktree Symphony Bridges (ports 4325-4328)  ← Per-worktree isolation
       ↓ isolated working directory
Provider Cascade → LLM API → Tool execution
       ↓
Git Worktrees (wt5-wt8)
```

## Components

### 1. OpenClaw Gateway (Singleton)

- **Port:** 18789
- **Lock file:** `~/.cache/anqr-openclaw/gateway.lock`
- **Service:** `anqr-discord-bridge@{5,6,7,8}.timer` (4 competing instances, 1 wins lock)
- Only ONE gateway process runs across all Discord worktrees
- Automatic failover if owner crashes
- Disables Bonjour/advertising to prevent hostname conflicts

**Config files (3 locations with merge behavior):**

| Config | symphony-bridge URL | Notes |
|--------|-------------------|-------|
| `~/.openclaw/openclaw.json` | `http://127.0.0.1:18790/v1` | Global config |
| `.openclaw/openclaw.json` (in-repo) | `http://127.0.0.1:18790/v1` | Project config |
| `.openclaw/models.json` (in-repo) | `http://127.0.0.1:4319/v1` | ⚠️ **OVERRIDES to main bridge!** |

### 2. Discord Request Router

- **Port:** 18790
- **Service:** `anqr-discord-router.service`
- **Implementation:** `scripts/ops/integrations/model/discord-request-router.mjs`
- Least-loaded worktree selection
- Rebases `cwd` in request payload to target worktree path
- Returns 429 when all 4 worktrees at capacity

### 3. Worktree Symphony Bridges

| Worktree | Port | Directory |
|----------|------|-----------|
| wt5 | 4325 | `/home/user/src/anqr-wt5` |
| wt6 | 4326 | `/home/user/src/anqr-wt6` |
| wt7 | 4327 | `/home/user/src/anqr-wt7` |
| wt8 | 4328 | `/home/user/src/anqr-wt8` |

- **Service:** `anqr-symphony-bridge@{5,6,7,8}.service`
- Each runs in its own worktree directory via `WorkingDirectory`
- ExecStart uses main repo script path; cwd is the worktree
- Full provider cascade (same as main bridge)

## Request Flow

1. **Discord user sends message** → OpenClaw Gateway (port 18789)
2. **Gateway forwards to provider:** `POST http://127.0.0.1:18790/v1/chat/completions` (via symphony-bridge config)
3. **Router selects worktree:** Least-loaded of wt5-wt8, rebases cwd
4. **Router proxies to bridge:** `POST http://127.0.0.1:432{i}/v1/chat/completions` with `X-Worktree-ID: wt{i}`
5. **Bridge executes in worktree:** File operations scoped to `/home/user/src/anqr-wt{i}`
6. **Response streams back:** Bridge → Router → Gateway → Discord

## Resolved Defects (External Review 2026-03-31)

The following defects were identified by external code review and have been fixed:

- **F1: Codebuff client cwd caching** — `codebuff-openai-bridge.mjs` shared client was keyed by `costMode` only, ignoring `cwd`. Requests for one worktree could silently reuse a client created with a different cwd. **Fixed:** Client now keyed by `costMode + cwd`.
- **F2: Control script scope** — `symphony-control.mjs --start` enabled runner timers 1-8, but only wt1-wt4 are runner targets. **Fixed:** Now enables only runners 1-4.
- **F3: Bridge auto-start** — `symphony-openai-bridge.mjs` called `symphony-control.mjs --start` on every bridge startup, re-enabling wrong-scope runners. **Fixed:** Auto-start removed; runner timers managed independently.

See `docs/harness/12-concurrent-execution-with-worktrees.md` Section 4A for full evidence.

## Critical Issues (Config — Unverified at Runtime)

### Issue 1: `models.json` Overrides Provider URL (CRITICAL)

The in-repo `.openclaw/models.json` sets `symphony-bridge.baseUrl` to `http://127.0.0.1:4319/v1` (the **main** Symphony Bridge). Since `models.json` likely takes precedence over `openclaw.json` in the merge chain, OpenClaw may send ALL AI requests directly to port 4319, **completely bypassing the Discord Router and worktree bridges**.

**Fix:** Update `models.json` to use `http://127.0.0.1:18790/v1`, or remove the `symphony-bridge` provider from `models.json` entirely.

### Issue 2: Workspace Config Points to Main (CRITICAL)

All `.openclaw/openclaw.json` files (git-tracked) have `"workspace": "/home/user/src/anqr"`. This anchors OpenClaw's tool operations to the main repo regardless of bridge cwd.

**Four layers of isolation defense:**

| Layer | Status | Notes |
|-------|--------|-------|
| 1. Provider URL routing (to router, not main bridge) | ❌ `models.json` may override | See Issue 1 |
| 2. Systemd `WorkingDirectory` (bridge cwd = worktree) | ✅ Implemented | |
| 3. Router cwd rebase (rewrites request paths) | ✅ Implemented | |
| 4. OpenClaw workspace (anchors tool ops) | ❌ Points to main | Git-tracked, identical everywhere |

### Issue 3: Duplicate Gateway Services

Both `openclaw-gateway.service` (created by OpenClaw CLI) and `anqr-discord-bridge@.service` (ANQR harness) try to bind port 18789. Remove the standalone `openclaw-gateway.service`.

## Monitoring

```bash
# Router health
curl http://127.0.0.1:18790/health | jq

# Bridge health
for i in 5 6 7 8; do curl -s http://127.0.0.1:432$i/health | jq '.status'; done

# Service status
systemctl --user status anqr-discord-router.service
systemctl --user status anqr-symphony-bridge@{5,6,7,8}.service
```

## Deployment

```bash
# Deploy services
cp services/systemd/anqr-symphony-bridge@.service ~/.config/systemd/user/
cp services/systemd/anqr-discord-router.service ~/.config/systemd/user/
cp services/systemd/anqr-discord-bridge@.service ~/.config/systemd/user/
cp services/systemd/anqr-discord-bridge@.timer ~/.config/systemd/user/
systemctl --user daemon-reload

# Enable (wt5-wt8 ONLY)
systemctl --user enable --now anqr-symphony-bridge@{5,6,7,8}.service
systemctl --user enable --now anqr-discord-router.service
systemctl --user enable --now anqr-discord-bridge@{5,6,7,8}.timer

# Remove duplicate gateway
systemctl --user disable --now openclaw-gateway.service 2>/dev/null
rm -f ~/.config/systemd/user/openclaw-gateway.service
rm -f ~/.config/systemd/user/openclaw-gateway.service.bak
```

## Related Files

- `scripts/ops/integrations/model/discord-request-router.mjs` — Router implementation
- `scripts/ops/integrations/model/symphony-openai-bridge.mjs` — Bridge implementation
- `scripts/ops/runtime/discord/openclaw-gateway-singleton.mjs` — Gateway singleton wrapper
- `.openclaw/openclaw.json` — In-repo OpenClaw config (models, workspace, gateway)
- `.openclaw/models.json` — In-repo model provider overrides (⚠️ config conflict source)
- `services/systemd/anqr-discord-router.service` — Router service
- `services/systemd/anqr-symphony-bridge@.service` — Bridge template
- `services/systemd/anqr-discord-bridge@.service` — Gateway singleton template

---

**Last Updated:** 2026-03-31
