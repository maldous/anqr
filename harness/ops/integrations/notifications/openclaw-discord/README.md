# ANQR OpenClaw Discord Notifications

## 1. Directory Overview

This directory implements **ANQR OpenClaw Discord Notifications** within the ANQR harness. Key immediate entries include `index.mjs`, `send-via-open-claw.mjs`, `discord-text-channel-id.mjs`, `stream-discord-update.mjs`. The current inventory is 15 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **color-to-emoji.mjs** - Exports `colorToEmoji`, which implements color to emoji.
- **discord-stream-buffers.mjs** - Exports `discordStreamBuffers`, which implements discord stream buffers.
- **discord-text-channel-id.mjs** - Exports `DISCORD_TEXT_CHANNEL_ID`, a shared constant used by sibling modules.
- **flush-discord-stream.mjs** - Exports `flushDiscordStream`, which implements flush discord stream.
- **index.mjs** - Facade module that re-exports public members from `./openclaw-gateway-host.mjs`, `./openclaw-gateway-port.mjs`, `./openclaw-gateway-token.mjs`, `./discord-text-channel-id.mjs`, `./discord-stream-buffers.mjs`, `./stream-interval-ms.mjs`, and 6 more siblings.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logWarn`.
- **openclaw-gateway-host.mjs** - Exports `OPENCLAW_GATEWAY_HOST`, a shared constant used by sibling modules.
- **openclaw-gateway-port.mjs** - Exports `OPENCLAW_GATEWAY_PORT`, a shared constant used by sibling modules.
- **openclaw-gateway-token.mjs** - Exports `OPENCLAW_GATEWAY_TOKEN`, a shared constant used by sibling modules.
- **send-discord-embed.mjs** - Exports `sendDiscordEmbed`, which implements send discord embed.
- **send-discord-message.mjs** - Exports `sendDiscordMessage`, which implements send discord message.
- **send-via-open-claw.mjs** - Exports `sendViaOpenClaw`, which implements send via open claw.
- **stream-discord-update.mjs** - Exports `streamDiscordUpdate`, which implements stream discord update.
- **stream-interval-ms.mjs** - Exports `STREAM_INTERVAL_MS`, a shared constant used by sibling modules.
- **stream-max-length.mjs** - Exports `STREAM_MAX_LENGTH`, a shared constant used by sibling modules.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include network/API integration, timer, scheduling, cooldown, or watchdog behavior, Discord integration, and OpenClaw integration. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/integrations/notifications/openclaw-discord/index.mjs";
```

## 5. Dependencies

- **Node.js built-ins** - `node:http`
- **Internal relative modules** - `../../../lib/logger.mjs`, `./color-to-emoji.mjs`, `./discord-stream-buffers.mjs`, `./discord-text-channel-id.mjs`, `./flush-discord-stream.mjs`, `./logger.mjs`, `./openclaw-gateway-host.mjs`, `./openclaw-gateway-port.mjs`, `./openclaw-gateway-token.mjs`, `./send-via-open-claw.mjs`, `./stream-interval-ms.mjs`, `./stream-max-length.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
