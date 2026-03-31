# Worktree Service Deployment

> **Full reference:** [docs/harness/12-concurrent-execution-with-worktrees.md](/home/user/src/anqr/docs/harness/12-concurrent-execution-with-worktrees.md) — includes phased delivery plan (Section 17) and E2E testing strategy (Section 18)

## Current State (2026-03-31)

**ALL services are STOPPED.** Multiple issues identified:

- Deployed service files differ from repo versions (multiple files out of date)
- Duplicate `openclaw-gateway.service` (created by OpenClaw CLI) conflicts with ANQR gateway singleton
- Wrong-ID template instantiations: runner@{5-8} and discord-bridge@{1-4} should not exist
- `models.json` may override symphony-bridge URL to main bridge (4319) instead of router (18790)

See the primary worktree documentation for full gap analysis.

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

## Known Issues (Config — Unverified at Runtime)

### 1. `models.json` Overrides Provider URL (CRITICAL)

`.openclaw/models.json` sets `symphony-bridge.baseUrl` to `http://127.0.0.1:4319/v1` (main bridge), while `openclaw.json` correctly sets it to `http://127.0.0.1:18790/v1` (router). Since `models.json` likely wins the merge, OpenClaw may bypass the router entirely.

**Fix:** Update `models.json` baseUrl to `18790`, or remove `symphony-bridge` provider from `models.json`.

### 2. Workspace Config Points to Main

`.openclaw/openclaw.json` (git-tracked) has `workspace: /home/user/src/anqr` in all worktrees. OpenClaw may anchor tool operations to main regardless of bridge cwd.

**Fix:** Bridge must override workspace from `ANQR_WORKTREE_PATH` env var.

### 3. Duplicate Gateway Service

`openclaw-gateway.service` was created by OpenClaw CLI and conflicts with `anqr-discord-bridge@.service`. Remove the standalone service.

**Warning:** Running `openclaw service install` or `openclaw doctor` may recreate it.

### 4. Deployed Files Drift from Repo

Re-run deploy commands above to copy fresh files from repo.

---

**Last Updated:** 2026-03-31
**Related:** [docs/harness/12-concurrent-execution-with-worktrees.md](/home/user/src/anqr/docs/harness/12-concurrent-execution-with-worktrees.md)
