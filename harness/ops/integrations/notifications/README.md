# Notifications

## Purpose

Directory for OpenClaw gateway/runtime configuration; immediate files include `openclaw-discord.mjs`, `test-discord.mjs`, with child directories `openclaw-discord/`, `test-discord/`.

## Contents

- 2 immediate files
- 2 child directories

## Key Files

- `openclaw-discord.mjs` - JavaScript/TypeScript module used by this directory.
- `test-discord.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories

- `openclaw-discord/` - Directory for OpenClaw gateway/runtime configuration; immediate files include `color-to-emoji.mjs`, `create-discord-thread.mjs`, `discord-stream-buffers.mjs`, `discord-text-channel-id.mjs`, and others, with child directories `discord-thread-cache/`, `send-via-open-claw/`.
- `test-discord/` - Directory for OpenClaw gateway/runtime configuration; immediate files include `index.mjs`, `logger.mjs`, `openclaw-gateway-host.mjs`, `openclaw-gateway-port.mjs`, and others.

## Operational Notes

- Current on-disk inventory: 2 immediate files and 2 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
