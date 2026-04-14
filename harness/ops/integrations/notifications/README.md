# Notifications

## Purpose
Notifications contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents
- 2 immediate files
- 2 child directories

## Key Files
- `openclaw-discord.mjs` - JavaScript/TypeScript module used by this directory.
- `test-discord.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories
- `openclaw-discord/` - Openclaw Discord scope; immediate files include `color-to-emoji.mjs`, `create-discord-thread.mjs`, `discord-stream-buffers.mjs`, `discord-text-channel-id.mjs`, and others; child directories include `discord-thread-cache/`, `send-via-open-claw/`.
- `test-discord/` - Test Discord scope; immediate files include `index.mjs`, `logger.mjs`, `openclaw-gateway-host.mjs`, `openclaw-gateway-port.mjs`, and others.

## Operational Notes
- Current on-disk inventory: 2 immediate file(s) and 2 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
