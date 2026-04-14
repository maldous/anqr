# Discord

## Purpose

Directory for OpenClaw gateway/runtime configuration; immediate files include `openclaw-gateway-singleton.mjs`, with child directories `openclaw-gateway-singleton/`.

## Contents

- 1 immediate file
- 1 child directory

## Key Files

- `openclaw-gateway-singleton.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories

- `openclaw-gateway-singleton/` - Directory for OpenClaw gateway/runtime configuration; immediate files include `child-process.mjs`, `cleanup-stale-lock.mjs`, `cli.mjs`, `config-path.mjs`, and others.

## Operational Notes

- Current on-disk inventory: 1 immediate file and 1 child directory.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether runtime bootstrap assumptions and configuration boundaries still match the service topology described in the ADRs and workspace model.
