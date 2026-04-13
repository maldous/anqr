# Watchdog

## Purpose
Directory for fleet recovery, quarantine, and health enforcement; immediate files include `bridge-watchdog.mjs`, with child directories `bridge-watchdog/`.

## Contents
- 1 immediate file
- 1 child directory

## Key Files
- `bridge-watchdog.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories
- `bridge-watchdog/` - Directory for fleet recovery, quarantine, and health enforcement; immediate files include `activating-state-start.mjs`, `catastrophic-patterns.mjs`, `check-file-integrity.mjs`, `check-health-endpoint.mjs`, and others, with child directories `quarantine-and-restart/`.

## Operational Notes
- Current on-disk inventory: 1 immediate file and 1 child directory.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether runtime bootstrap assumptions and configuration boundaries still match the service topology described in the ADRs and workspace model.
