# Systemd contract

All services run as **user services** (`systemctl --user`), not system services.

## Install

```bash
cp services/systemd/*.service ~/.config/systemd/user/
cp services/systemd/*.timer ~/.config/systemd/user/
cp services/systemd/anqr-ops.env ~/.config/systemd/user/
systemctl --user daemon-reload
```

## Long-running services

| Service | Port | Purpose |
|---|---:|---|
| `anqr-symphony-router.service` | 4319 | Global Symphony orchestration (control plane) |
| `anqr-symphony-executor@.service` | 4321-4328 | Worktree-local Symphony executors (execution plane) |
| `anqr-linear-runner@.service` | — | Linear issue poller and scheduler |
| `anqr-discord-router.service` | 18790 | Discord request load balancer |
| `anqr-context7-mcp.service` | 4320 | Context7 MCP documentation service |
| `anqr-watchdog.service` | — | Health monitoring for router and executors |

## Runtime posture

**Control plane (global):**
- `anqr-symphony-router.service` receives work from Discord and Linear ingress
- `anqr-discord-router.service` handles Discord request load balancing
- `anqr-linear-runner@.service` polls Linear for issues

**Execution plane (per-worktree):**
- `anqr-symphony-executor@1-4.service` are reserved for Linear work
- `anqr-symphony-executor@5-8.service` are reserved for Discord work
- Each executor performs all AI execution, file mutation, git operations, and validation
- Codebuff is a provider used by executors, not a standalone service
