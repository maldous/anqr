# Tools

## Purpose
Tools contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents
- 4 immediate files
- 4 child directories

## Key Files
- `recover-stale-in-progress.mjs` - JavaScript/TypeScript module used by this directory.
- `reset-retry-exhausted.mjs` - JavaScript/TypeScript module used by this directory.
- `startup-recovery.mjs` - JavaScript/TypeScript module used by this directory.
- `verify-webhook-system.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories
- `linear-status/` - Linear Status scope; immediate files include `index.mjs`, `logger.mjs`, `main.mjs`, `runtime.mjs`; child directories include `logger/`, `main/`.
- `recover-stale-in-progress/` - Recover Stale In Progress scope; immediate files include `index.mjs`, `issue-age.mjs`, `logger.mjs`, `main.mjs`, and others.
- `startup-recovery/` - Startup Recovery scope; immediate files include `index.mjs`, `logger.mjs`, `main.mjs`, `run-command.mjs`, and others.
- `verify-webhook-system/` - Verify Webhook System scope; immediate files include `check-systemd-service.mjs`, `check-systemd-timer.mjs`, `get-systemd-status.mjs`, `index.mjs`, and others.

## Operational Notes
- Current on-disk inventory: 4 immediate file(s) and 4 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
