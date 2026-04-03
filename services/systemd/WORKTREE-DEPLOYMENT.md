# Worktree Service Deployment

## Target architecture

**Global services:**
- `anqr-symphony-router.service` — Single public Symphony orchestration (control plane) on port `4319`
- `anqr-discord-router.service` — Discord request load balancer on port `18790`
- `anqr-linear-runner@.service` — Linear issue poller (wt1-wt4)
- `anqr-symphony-integrator.service` — Single writer to origin/main (integration queue)
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
cp services/systemd/anqr-symphony-integrator.service ~/.config/systemd/user/
cp services/systemd/anqr-watchdog.service ~/.config/systemd/user/
systemctl --user daemon-reload

# Enable and start services
systemctl --user enable --now anqr-symphony-router.service
systemctl --user enable --now anqr-symphony-executor@{1,2,3,4,5,6,7,8}.service
systemctl --user enable --now anqr-linear-runner@{1,2,3,4}.timer
systemctl --user enable --now anqr-discord-router.service
systemctl --user enable --now anqr-context7-mcp.service
systemctl --user enable --now anqr-symphony-integrator.service
systemctl --user enable --now anqr-watchdog.service
```

## Request flow

```text
Linear  → anqr-linear-runner@1-4 → executor wt1-4 → commit/push origin/symphony/wtN
Discord → OpenClaw → discord-router → executor wt5-8 → local changes only unless explicit finalize
Integrator → queued worktree branches → origin/main
```

### Integration flow

```text
1. Worktree executor edits and validates in isolated wtN
2. Runner commits locally in wtN
3. Runner pushes only to origin/symphony/wtN
4. Runner records integration_pending in shared state
5. Single integrator serially promotes queued work to origin/main
6. Issue moves to Done only after successful integration to main
7. Any commit/integration failure stays attached to same issue + same wtN
```

## Validation Concurrency Control

When multiple executors run validation simultaneously, heavy commands (vitest, typecheck) are serialized system-wide using `flock` file locks:

| Command | Lock File | Timeout |
|---------|-----------|--------|
| vitest | `/tmp/anqr-vitest.lock` | 240s (120s wait + 120s run) |
| typecheck | `/tmp/anqr-typecheck.lock` | 240s (120s wait + 120s run) |

This prevents resource exhaustion from concurrent vitest/tsc processes across worktrees. The locks are implemented in `scripts/ops/core/symphony-validation.mjs` using the `flock -w 120` fd-redirect pattern.

Additionally, `vitest.config.ts` enforces single-worker mode (`maxWorkers: 1`, `fileParallelism: false`) so each vitest process uses minimal resources.

### Environment variables

| Variable | Purpose |
|----------|--------|
| `ANQR_AUTOMATION_COMMIT=1` | Skip lefthook pre-commit hooks during automation |
| `ANQR_AUTOMATION_PUSH=1` | Skip lefthook pre-push hooks during automation |
| `ANQR_BRIDGE_ENABLE_GIT_AUTOFINALIZE=0` | Prevent bridge from pushing to main (auto-finalize disabled) |

These are set in `anqr-symphony-executor@.service`.

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
