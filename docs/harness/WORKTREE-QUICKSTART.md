# Worktree Quick Start Guide

**Goal:** Single global Symphony router with executors in isolated git worktrees.

## Quick start

```bash
cd /home/user/src/anqr
node harness/ops/orchestration/symphony-worktree-pool.mjs init 8

# Copy service files
cp services/systemd/anqr-symphony-router.service ~/.config/systemd/user/
cp services/systemd/anqr-symphony-executor@.service ~/.config/systemd/user/
# Install all services via Makefile:
make install-services
cp services/systemd/anqr-discord-router.service ~/.config/systemd/user/
cp services/systemd/anqr-context7-mcp.service ~/.config/systemd/user/
cp services/systemd/anqr-watchdog.service ~/.config/systemd/user/
systemctl --user daemon-reload

# Enable and start
systemctl --user enable --now anqr-symphony-router.service
systemctl --user enable --now anqr-symphony-executor@{1,2,3,4,5,6,7,8}.service
systemctl --user enable --now anqr-linear-reconciler.service
systemctl --user enable --now anqr-symphony-executor@{1,2,3,4}.service
systemctl --user enable --now anqr-discord-router.service
systemctl --user enable --now anqr-context7-mcp.service
systemctl --user enable --now anqr-watchdog.service
```

## Architecture

```text
Discord → OpenClaw → anqr-discord-router → anqr-symphony-router → anqr-symphony-executor@5-8
Linear  → anqr-linear-webhook → anqr-symphony-router → anqr-symphony-executor@1-4
                                  ↑ anqr-linear-reconciler (level-triggered backlog pickup)
```

## Worktree mapping

| Worktree | Pool    | Service                                 |
| -------- | ------- | --------------------------------------- |
| wt1-wt4  | Linear  | `anqr-symphony-executor@{1..4}.service` |
| wt5-wt8  | Discord | `anqr-symphony-executor@{5..8}.service` |

## Notes

- No standalone Codebuff bridge — Codebuff is a provider used by executors
- Router = control plane, Executors = execution plane
- Root repo is control-plane only; mutation belongs in worktrees
- **Auto sync/push:** Each bridge syncs from `origin/main` before each request and pushes changes after completion
- **Round-robin routing:** Both routers distribute requests evenly across equally-loaded worktrees
- **Voice announcements:** Bridge announces startup, request start, and completion via OpenClaw voice
