# Openclaw Discord

## Purpose
Openclaw Discord contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents

- 19 immediate files
- 2 child directories

## Key Files

- `color-to-emoji.mjs` - Exports `colorToEmoji`, the main helper defined in this file.
- `create-discord-thread.mjs` - Exports `createDiscordThread`, the main helper defined in this file.
- `discord-stream-buffers.mjs` - Exports `discordStreamBuffers`, a shared constant or state value used by sibling modules.
- `discord-text-channel-id.mjs` - Exports `DISCORD_TEXT_CHANNEL_ID`, a shared constant or state value used by sibling modules.
- `discord-thread-cache.mjs` - Re-export facade that assembles the public surface for this directory.
- `finalize-discord-stream.mjs` - Exports `finalizeDiscordStream`, the main helper defined in this file.
- `flush-discord-stream.mjs` - Exports `flushDiscordStream`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `invoke-gateway.mjs` - Exports `invokeGateway`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `openclaw-gateway-host.mjs` - Exports `OPENCLAW_GATEWAY_HOST`, a shared constant or state value used by sibling modules.
- `openclaw-gateway-port.mjs` - Exports `OPENCLAW_GATEWAY_PORT`, a shared constant or state value used by sibling modules.
- `openclaw-gateway-token.mjs` - Exports `OPENCLAW_GATEWAY_TOKEN`, a shared constant or state value used by sibling modules.
- `send-discord-embed.mjs` - Exports `sendDiscordEmbed`, the main helper defined in this file.
- `send-discord-message.mjs` - Exports `sendDiscordMessage`, the main helper defined in this file.
- `send-via-open-claw.mjs` - Re-export facade that assembles the public surface for this directory.
- `stream-discord-update.mjs` - Exports `streamDiscordUpdate`, the main helper defined in this file.
- `stream-interval-ms.mjs` - Exports `STREAM_INTERVAL_MS`, a shared constant or state value used by sibling modules.
- `stream-max-length.mjs` - Exports `STREAM_MAX_LENGTH`, a shared constant or state value used by sibling modules.

## Subdirectories
- `discord-thread-cache/` - Discord Thread Cache scope; immediate files include `get-thread-channel-id.mjs`, `index.mjs`, `set-thread-channel-id.mjs`, `thread-cache-instance.mjs`.
- `send-via-open-claw/` - Send Via Open Claw scope; immediate files include `delete-via-open-claw.mjs`, `index.mjs`, `send-via-open-claw.mjs`.

## Operational Notes
- Current on-disk inventory: 19 immediate file(s) and 2 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
