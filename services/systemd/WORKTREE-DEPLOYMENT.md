# Worktree Service Deployment

> **Full reference:** [docs/harness/12-concurrent-execution-with-worktrees.md](/home/user/src/anqr/docs/harness/12-concurrent-execution-with-worktrees.md) — includes phased delivery plan (Section 17) and E2E testing strategy (Section 18)

## Current State (2026-03-31)

**All services OPERATIONAL.** All issues identified by external review have been resolved through Phases 1-7:

- ✅ Service files reconciled and deployed from repo (Phase 2)
- ✅ Duplicate `openclaw-gateway.service` removed; singleton has port-alive detection (Phase 2)
- ✅ Wrong-ID template instantiations removed (Phase 2)
- ✅ `models.json` updated to point to router (18790); `openclaw.json` wins merge (Phase 3)
- ✅ All 7 ports listening: 4319, 4325-4328, 18789, 18790 (Phase 4)
- ✅ Discord isolation verified (Phase 5), Linear execution verified (Phase 6), concurrent ops verified (Phase 7)

See the primary worktree documentation for full evidence.

## Deploy All Services

```bash
# Step 1: Copy ALL service files from repo
cp services/systemd/anqr-symphony-bridge.service ~/.config/systemd/user/
cp services/systemd/anqr-symphony-bridge@.service ~/.config/systemd/user/
cp services/systemd/anqr-symphony-runner@.service ~/.config/systemd/user/
cp services/systemd/anqr-symphony-runner@.timer ~/.config/systemd/user/
cp services/systemd/anqr-discord-router.service ~/.config/systemd/user/
cp services/systemd/anqr-discord-bridge@.service ~/.config/systemd/user/
cp services/systemd/anqr-discord-bridge@.timer ~/.config/systemd/user/

# Step 2: Reload systemd
systemctl --user daemon-reload

# Step 3: Enable core services
systemctl --user enable --now anqr-symphony-bridge.service
systemctl --user enable --now anqr-symphony-runner@{1,2,3,4}.timer
systemctl --user enable --now anqr-symphony-bridge@{5,6,7,8}.service
systemctl --user enable --now anqr-discord-router.service
systemctl --user enable --now anqr-discord-bridge@{5,6,7,8}.timer

# Step 4: Clean up legacy and incorrect services
systemctl --user disable --now anqr-symphony-runner.timer 2>/dev/null
systemctl --user disable --now anqr-symphony-runner.service 2>/dev/null
rm -f ~/.config/systemd/user/anqr-symphony-runner.service
rm -f ~/.config/systemd/user/anqr-symphony-runner.timer

# Remove wrong-ID instances
systemctl --user disable --now anqr-symphony-runner@{5,6,7,8}.timer 2>/dev/null
systemctl --user disable --now anqr-discord-bridge@{1,2,3,4}.timer 2>/dev/null

# Remove duplicate OpenClaw gateway (created by OpenClaw CLI)
systemctl --user disable --now openclaw-gateway.service 2>/dev/null
rm -f ~/.config/systemd/user/openclaw-gateway.service
rm -f ~/.config/systemd/user/openclaw-gateway.service.bak

systemctl --user daemon-reload
systemctl --user reset-failed
```

## Service → Port Mapping

| Service | Port | Worktree | Purpose |
|---------|------|----------|---------|
| `anqr-symphony-bridge.service` | 4319 | main | Main bridge for Linear runners |
| `anqr-symphony-bridge@5.service` | 4325 | wt5 | Discord worktree bridge #1 |
| `anqr-symphony-bridge@6.service` | 4326 | wt6 | Discord worktree bridge #2 |
| `anqr-symphony-bridge@7.service` | 4327 | wt7 | Discord worktree bridge #3 |
| `anqr-symphony-bridge@8.service` | 4328 | wt8 | Discord worktree bridge #4 |
| `anqr-discord-router.service` | 18790 | main | Load balancer: Discord → worktree bridges |
| `anqr-discord-bridge@{5-8}` (singleton) | 18789 | wt5-8 | OpenClaw Gateway (one instance via lock) |

## Request Flow

**Discord:** User → OpenClaw Gateway (18789) → Router (18790) → Worktree Bridge (4325-4328) → AI

**Linear:** Todo issue → Runner (wt1-wt4) → Main Bridge (4319) → AI → Commit → Push

## Verify Deployment

```bash
# Services running
systemctl --user list-units --type=service | grep anqr | grep running

# Timers active
systemctl --user list-timers | grep anqr

# Ports listening
ss -tln | grep -E '(4319|4325|4326|4327|4328|18789|18790)'

# Health checks
curl -s http://127.0.0.1:4319/health | jq '.status'
curl -s http://127.0.0.1:18790/health | jq '.status'
for i in 5 6 7 8; do curl -s http://127.0.0.1:432$i/health | jq '.status'; done

# Verify no wrong-ID services
systemctl --user list-units | grep -E 'runner@[5-8]|discord-bridge@[1-4]'
# Should show nothing
```

## Resolved Defects (External Review 2026-03-31)

The following code defects were identified by external review and have been fixed:

- **F1: Codebuff client cwd caching** — Shared client now keyed by `costMode + cwd` (was `costMode` only)
- **F2: Control script scope** — `symphony-control.mjs --start` now enables only runners 1-4 (was 1-8)
- **F3: Bridge auto-start** — Bridge startup no longer calls `symphony-control.mjs --start`

### Required Systemd Cleanup (F4)

```bash
# Remove wrong-ID runner instances (runners are wt1-wt4 only)
systemctl --user disable --now anqr-symphony-runner@5.timer 2>/dev/null
systemctl --user disable --now anqr-symphony-runner@6.timer 2>/dev/null
systemctl --user disable --now anqr-symphony-runner@7.timer 2>/dev/null
systemctl --user disable --now anqr-symphony-runner@8.timer 2>/dev/null

# Remove wrong-ID discord-bridge instances (Discord bridges are wt5-wt8 only)
systemctl --user disable --now anqr-discord-bridge@1.timer 2>/dev/null
systemctl --user disable --now anqr-discord-bridge@2.timer 2>/dev/null
systemctl --user disable --now anqr-discord-bridge@3.timer 2>/dev/null
systemctl --user disable --now anqr-discord-bridge@4.timer 2>/dev/null

# Remove legacy single runner
systemctl --user disable --now anqr-symphony-runner.service 2>/dev/null
systemctl --user disable --now anqr-symphony-runner.timer 2>/dev/null

# Remove duplicate openclaw-gateway.service
systemctl --user disable --now openclaw-gateway.service 2>/dev/null
rm -f ~/.config/systemd/user/openclaw-gateway.service
rm -f ~/.config/systemd/user/openclaw-gateway.service.bak

systemctl --user daemon-reload
```

## Resolved Issues (All Verified)

### 1. `models.json` Provider URL — ✅ RESOLVED (Phase 3)

`models.json` updated to `http://127.0.0.1:18790/v1`. Verified via `openclaw config get` that `openclaw.json` wins the merge. Both files now agree.

### 2. Workspace Config — ✅ VERIFIED SAFE (Phase 3)

Bridge ignores the `workspace` field. Router rebases `cwd` to the target worktree path. Not a runtime isolation issue.

### 3. Duplicate Gateway Service — ✅ RESOLVED (Phase 2)

Removed `openclaw-gateway.service`. Gateway singleton script now has port-alive detection — enters monitoring mode if an external gateway already owns the port.

**Warning:** Running `openclaw service install` or `openclaw doctor` may recreate the standalone service. Re-remove it if this happens.

### 4. Deployed Files Drift — ✅ RESOLVED (Phase 2)

All service files reconciled and deployed from repo. Re-run deploy commands above if files drift again.

---

**Last Updated:** 2026-03-31
**Related:** [docs/harness/12-concurrent-execution-with-worktrees.md](/home/user/src/anqr/docs/harness/12-concurrent-execution-with-worktrees.md)
