# Default Target

## Purpose

Systemd symlink directory for services auto-started at user login. Contains enabled unit symlinks for the full harness topology.

## Contents

- 20 immediate files
- 0 child directories

## Key Files

- `anqr-context7-mcp.service` - systemd unit for ANQR Context7 MCP Documentation Service.
- `anqr-discord-router.service` - systemd unit for ANQR Discord request router (load balancer).
- `anqr-linear-webhook.service` - systemd unit for ANQR Linear webhook receiver (event-driven ingress).
- `anqr-symphony-executor@1.service` through `anqr-symphony-executor@8.service` - systemd units for ANQR Symphony executors for worktrees wt1–wt8.
- `anqr-symphony-integrator.service` - systemd unit for ANQR Symphony integrator.
- `anqr-symphony-router.service` - systemd unit for ANQR Symphony router (control plane / orchestration).
- `anqr-symphony-scheduler.service` - systemd unit for ANQR Symphony Scheduler (ADR-0002 authoritative claim+dispatch).
- `anqr-symphony-worktree-recovery.service` - systemd unit for ANQR Symphony Worktree Recovery Daemon.
- `anqr-watchdog.service` - systemd unit for ANQR Symphony Router and Executor Watchdog.
- `model-injector-proxy.service` - systemd unit for Model Injector Proxy.
- `openclaw-gateway.service` - systemd unit for OpenClaw Gateway.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 20 immediate file(s) and 0 child directories.
- These are symlinks to the parent `services/systemd/` units; they define which services auto-start.

## Review Focus

Check that enabled units match the current architecture and no stale or missing symlinks exist.
