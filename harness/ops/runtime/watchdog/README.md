# Watchdog

## Purpose

Watchdog contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents

- 1 immediate file
- 1 child directory

## Key Files

- `bridge-watchdog.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories

- `bridge-watchdog/` - Bridge Watchdog scope; immediate files include `activating-state-start.mjs`, `catastrophic-patterns.mjs`, `check-file-integrity.mjs`, `check-health-endpoint.mjs`, and others; child directories include `quarantine-and-restart/`.

## Operational Notes

- Current on-disk inventory: 1 immediate file(s) and 1 child directory.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus

Check that the current implementation in this directory still matches its intended role in the harness architecture.
