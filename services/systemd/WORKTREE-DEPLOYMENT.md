# Worktree Service Deployment

## Target architecture

**Global services:**
- `anqr-symphony-router.service` — Single public Symphony orchestration (control plane) on port `4319`
- `anqr-discord-router.service` — Discord request load balancer on port `18790`
- `anqr-linear-runner@.service` — Linear issue poller (wt1-wt4)
- `anqr-context7-mcp.service` — Documentation service on port `4320`
- `anqr-watchdog.service` — Health monitoring

**Worktree executors:**
- `anqr-symphony-executor@{1..4}.service` — Reserved for Linear work (ports `4321..4324`)
- `anqr-symphony-executor@{5..8}.service` — Reserved for Discord work (ports `4325..4328`)

**Note:** Codebuff is a provider used by executors, not a standalone service (per ADR-0003).

## Deploy

```bash
# Copy all service and timer files
cp services/systemd/anqr-symphony-router.service ~/.config/systemd/user/
cp services/systemd/anqr-symphony-executor@.service ~/.config/systemd/user/
cp services/systemd/anqr-linear-runner@.service ~/.config/systemd/user/
cp services/systemd/anqr-linear-runner@.timer ~/.config/systemd/user/
cp services/systemd/anqr-discord-router.service ~/.config/systemd/user/
cp services/systemd/anqr-context7-mcp.service ~/.config/systemd/user/
cp services/systemd/anqr-watchdog.service ~/.config/systemd/user/
systemctl --user daemon-reload

# Enable and start services
systemctl --user enable --now anqr-symphony-router.service
systemctl --user enable --now anqr-symphony-executor@{1,2,3,4,5,6,7,8}.service
systemctl --user enable --now anqr-linear-runner@{1,2,3,4}.timer
systemctl --user enable --now anqr-discord-router.service
systemctl --user enable --now anqr-context7-mcp.service
systemctl --user enable --now anqr-watchdog.service
```

## Request flow

```text
Discord → OpenClaw → anqr-discord-router → anqr-symphony-router → anqr-symphony-executor@5-8 → AI execution in worktree
Linear  → anqr-linear-runner    → anqr-symphony-router → anqr-symphony-executor@1-4 → AI execution in worktree
```

## Worktree mapping

| Worktree | Pool | Service |
|----------|------|---------|
| wt1 | Linear | `anqr-symphony-executor@1.service` |
| wt2 | Linear | `anqr-symphony-executor@2.service` |
| wt3 | Linear | `anqr-symphony-executor@3.service` |
| wt4 | Linear | `anqr-symphony-executor@4.service` |
| wt5 | Discord | `anqr-symphony-executor@5.service` |
| wt6 | Discord | `anqr-symphony-executor@6.service` |
| wt7 | Discord | `anqr-symphony-executor@7.service` |
| wt8 | Discord | `anqr-symphony-executor@8.service` |
