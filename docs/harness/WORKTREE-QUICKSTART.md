# Worktree Quick Start Guide

> **Full reference:** [12-concurrent-execution-with-worktrees.md](12-concurrent-execution-with-worktrees.md) — comprehensive documentation with gap analysis, phased delivery plan, E2E testing strategy, and third-party reviewer briefing.

**Goal:** Enable concurrent Symphony execution (wt1-wt4) and Discord isolation (wt5-wt8).

**Time required:** 15 minutes

**Prerequisites:**

- Full harness capability (systemd user services, credentials)
- OpenClaw CLI installed (`which openclaw`)
- 4+ GB RAM, 2+ CPU cores
- 4+ GB free disk space (200 MB per worktree × 8 + node_modules)

## Important Notes

**Runner timers vs bridge services:** Only wt1-wt4 use runner timers (`anqr-symphony-runner@{1,2,3,4}.timer`). Discord worktrees wt5-wt8 use bridge services (`anqr-symphony-bridge@{5,6,7,8}.service`), NOT runner timers. Do not enable `anqr-symphony-runner@{5,6,7,8}.timer` — this contradicts the architecture.

**Bridge startup:** Bridge processes do NOT auto-start runner timers. Use `symphony-control.mjs --start` to manage runners independently.

**Codebuff client isolation:** The Codebuff bridge shared client is keyed by both `costMode` and `cwd` to prevent cross-worktree isolation leaks.

## Quick Start

### Step 1: Create Worktrees (2 minutes)

```bash
cd /home/user/src/anqr
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 8
```

Verify:

```bash
git worktree list
# Should show: main + wt1 through wt8 (9 total)
```

### Step 2: Verify OpenClaw Config

The in-repo `.openclaw/models.json` should point to the Discord Router (port 18790). This was resolved in Phase 3 — verify it's still correct:

```bash
# Should show "http://127.0.0.1:18790/v1"
jq '.providers["symphony-bridge"].baseUrl' .openclaw/models.json
```

If it shows port 4319, update it to 18790. See [12-concurrent-execution-with-worktrees.md](12-concurrent-execution-with-worktrees.md) for details.

### Step 3: Deploy Systemd Services (1 minute)

```bash
# Copy ALL service and timer files
cp services/systemd/anqr-symphony-bridge.service ~/.config/systemd/user/
cp services/systemd/anqr-symphony-bridge@.service ~/.config/systemd/user/
cp services/systemd/anqr-symphony-runner@.service ~/.config/systemd/user/
cp services/systemd/anqr-symphony-runner@.timer ~/.config/systemd/user/
cp services/systemd/anqr-discord-router.service ~/.config/systemd/user/
cp services/systemd/anqr-discord-bridge@.service ~/.config/systemd/user/
cp services/systemd/anqr-discord-bridge@.timer ~/.config/systemd/user/
systemctl --user daemon-reload
```

### Step 4: Start Services (1 minute)

```bash
# Main Symphony bridge (must start first)
systemctl --user enable --now anqr-symphony-bridge.service

# Symphony runners (wt1-wt4 ONLY)
systemctl --user enable --now anqr-symphony-runner@{1,2,3,4}.timer

# Discord worktree bridges (wt5-wt8 ONLY)
systemctl --user enable --now anqr-symphony-bridge@{5,6,7,8}.service

# Discord router
systemctl --user enable --now anqr-discord-router.service

# Discord gateway singleton (wt5-wt8 ONLY)
systemctl --user enable --now anqr-discord-bridge@{5,6,7,8}.timer
```

### Step 5: Clean Up Legacy and Incorrect Services

```bash
# Remove retired single runner
systemctl --user disable --now anqr-symphony-runner.timer 2>/dev/null
systemctl --user disable --now anqr-symphony-runner.service 2>/dev/null
rm -f ~/.config/systemd/user/anqr-symphony-runner.service
rm -f ~/.config/systemd/user/anqr-symphony-runner.timer

# Remove wrong-ID instances
systemctl --user disable --now anqr-symphony-runner@{5,6,7,8}.timer 2>/dev/null
systemctl --user disable --now anqr-discord-bridge@{1,2,3,4}.timer 2>/dev/null

# Remove duplicate OpenClaw gateway (created by OpenClaw CLI, conflicts with our singleton)
systemctl --user disable --now openclaw-gateway.service 2>/dev/null
rm -f ~/.config/systemd/user/openclaw-gateway.service
rm -f ~/.config/systemd/user/openclaw-gateway.service.bak

systemctl --user daemon-reload
systemctl --user reset-failed
```

### Step 6: Verify (1 minute)

```bash
# Timers should be active
systemctl --user list-timers | grep anqr

# Services should be running
systemctl --user list-units --type=service | grep anqr | grep running

# Ports should be listening
ss -tln | grep -E '(4319|4325|4326|4327|4328|18789|18790)'

# Health checks
curl -s http://127.0.0.1:4319/health | jq '.status'   # Main bridge
curl -s http://127.0.0.1:18790/health | jq '.status'  # Discord router
```

## How It Works

**Discord flow:** Discord → OpenClaw Gateway (18789) → Discord Router (18790) → Worktree Bridge (4325-4328) → AI in worktree

**Linear flow:** Linear "Todo" → Symphony Runner (wt1-wt4) → Main Bridge (4319) → AI in worktree → Commit → Push to main

OpenClaw is a **single instance** that provides the Discord bot relay. It uses Symphony Bridge for AI processing. It does NOT contain the AI models.

## Worktree Classification

| Worktree | Type | Purpose | Concurrency |
|----------|------|---------|-------------|
| main | Control plane | Services, docs, config | N/A |
| wt1-wt4 | Symphony | Linear issue execution | Max 4 |
| wt5-wt8 | Discord | Interactive Discord requests | Max 4 |

**Total max concurrent:** 8 (4 Symphony + 4 Discord)

## Monitoring

```bash
# Watch all runner logs
journalctl --user -u 'anqr-symphony-runner@*.service' -f

# Watch Discord router
journalctl --user -u anqr-discord-router.service -f

# Check queue
node scripts/ops/orchestration/symphony-queue-control.mjs --check

# Worktree health
node scripts/ops/orchestration/symphony-worktree-pool.mjs status
```

## Troubleshooting

**Problem: No issues being picked up**

```bash
node scripts/ops/orchestration/symphony-queue-control.mjs --check
node scripts/ops/orchestration/symphony-queue-control.mjs --feed
```

**Problem: Runner appears stuck**

```bash
node scripts/ops/orchestration/symphony-queue-control.mjs --enforce
systemctl --user restart anqr-symphony-runner@1.service
```

**Problem: Discord commands go to main repo**

Check in order:

1. **`models.json` URL** — Should be `18790`: `jq '.providers["symphony-bridge"].baseUrl' .openclaw/models.json`
2. **Worktree bridges not running** — Check `systemctl --user status anqr-symphony-bridge@{5,6,7,8}.service`
3. **Router not running** — Check `curl http://127.0.0.1:18790/health`

**Note:** The `workspace` field in `.openclaw/openclaw.json` is safe — the bridge ignores it and the router rebases cwd to the worktree path (verified Phase 3).

**Problem: Services out of date**

```bash
cp services/systemd/anqr-*.service services/systemd/anqr-*.timer ~/.config/systemd/user/ 2>/dev/null
systemctl --user daemon-reload
```

**Problem: Worktree corrupted**

```bash
node scripts/ops/orchestration/symphony-worktree-pool.mjs repair
# Nuclear: recreate all
node scripts/ops/orchestration/symphony-worktree-pool.mjs cleanup
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 8
```

## Emergency Rollback

```bash
# Stop everything
systemctl --user stop 'anqr-symphony-runner@*.timer'
systemctl --user stop 'anqr-symphony-bridge@*.service'
systemctl --user stop anqr-discord-router.service
systemctl --user stop 'anqr-discord-bridge@*.timer'

# Run single runner only
systemctl --user enable --now anqr-symphony-runner@1.timer
```

**No data loss** — all state is in `$XDG_RUNTIME_DIR/anqr-symphony-state/`.

## Full Documentation

- [12-concurrent-execution-with-worktrees.md](12-concurrent-execution-with-worktrees.md) — comprehensive guide with gap analysis
- [discord-worktree-routing.md](discord-worktree-routing.md) — Discord routing architecture
- [WORKTREE-DEPLOYMENT.md](/home/user/src/anqr/services/systemd/WORKTREE-DEPLOYMENT.md) — deployment procedures

---

**Last Updated:** 2026-03-31
