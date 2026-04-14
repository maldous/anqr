# Email

## Purpose

Directory for harness support logic; immediate files include `email-ingest.mjs`, with child directories `email-ingest/`.

## Contents

- 1 immediate file
- 1 child directory

## Key Files

- `email-ingest.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories

- `email-ingest/` - Directory for runtime service bootstrap or environment support; immediate files include `allowed-senders.mjs`, `dirname.mjs`, `dry-run.mjs`, `ensure-dir.mjs`, and others.

## Operational Notes

- Current on-disk inventory: 1 immediate file and 1 child directory.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
