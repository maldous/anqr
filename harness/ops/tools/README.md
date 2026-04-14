# Tools

## Purpose

Directory for fleet recovery, quarantine, and health enforcement; immediate files include `recover-stale-in-progress.mjs`, `reset-retry-exhausted.mjs`, `startup-recovery.mjs`, `verify-webhook-system.mjs`, with child directories `linear-status/`, `recover-stale-in-progress/`, `startup-recovery/`, `verify-webhook-system/`.

## Contents

- 4 immediate files
- 4 child directories

## Key Files

- `recover-stale-in-progress.mjs` - JavaScript/TypeScript module used by this directory.
- `reset-retry-exhausted.mjs` - \*
- `startup-recovery.mjs` - JavaScript/TypeScript module used by this directory.
- `verify-webhook-system.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories

- `linear-status/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `index.mjs`, `logger.mjs`, `main.mjs`, `runtime.mjs`, with child directories `logger/`, `main/`.
- `recover-stale-in-progress/` - Directory for runtime service bootstrap or environment support; immediate files include `index.mjs`, `issue-age.mjs`, `logger.mjs`, `main.mjs`, and others.
- `startup-recovery/` - Directory for fleet recovery, quarantine, and health enforcement; immediate files include `index.mjs`, `logger.mjs`, `main.mjs`, `run-command.mjs`, and others.
- `verify-webhook-system/` - Directory for systemd topology and host runtime configuration; immediate files include `check-systemd-service.mjs`, `check-systemd-timer.mjs`, `get-systemd-status.mjs`, `index.mjs`, and others.

## Operational Notes

- Current on-disk inventory: 4 immediate files and 4 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
