# ANQR Notifications

## 1. Directory Overview

This directory contains notification integration modules for the ANQR (Agentic Number Query Runner) harness. It provides Discord-based notification capabilities through the OpenClaw gateway system, enabling the harness to send messages, embeds, and streaming updates to Discord channels. The directory follows a decomposition pattern where original monolithic files have been split into sibling modules, with facade files (ending in `.mjs`) re-exporting from matching directories containing `index.mjs` modules.

## 2. File Summaries

### Facade Modules (Auto-Generated)

These files are auto-generated facades that re-export from sibling modules under matching directories:

- **openclaw-discord.mjs** - Auto-generated facade exporting from `./openclaw-discord/index.mjs`. Provides the main notification functionality for sending messages and embeds via the OpenClaw Discord gateway.

- **test-discord.mjs** - Auto-generated facade exporting from `./test-discord/index.mjs` and `./test-discord/runtime.mjs`. Provides testing utilities for Discord notification functionality.

### openclaw-discord Subdirectory

This subdirectory contains the core Discord notification implementation:

- **index.mjs** - Generated facade index exporting all public API members including constants (`OPENCLAW_GATEWAY_HOST`, `OPENCLAW_GATEWAY_PORT`, `OPENCLAW_GATEWAY_TOKEN`, `DISCORD_TEXT_CHANNEL_ID`, `STREAM_INTERVAL_MS`, `STREAM_MAX_LENGTH`) and functions (`discordStreamBuffers`, `sendViaOpenClaw`, `sendDiscordMessage`, `sendDiscordEmbed`, `streamDiscordUpdate`, `flushDiscordStream`).

- **openclaw-gateway-host.mjs** - Configuration constant for the OpenClaw gateway host URL.

- **openclaw-gateway-port.mjs** - Configuration constant for the OpenClaw gateway port.

- **openclaw-gateway-token.mjs** - Authentication token for the OpenClaw gateway.

- **discord-text-channel-id.mjs** - Configuration constant for the target Discord text channel ID.

- **discord-stream-buffers.mjs** - Streaming buffer management for Discord message updates.

- **send-via-open-claw.mjs** - Core function for sending messages through the OpenClaw gateway.

- **send-discord-message.mjs** - Utility for sending plain text Discord messages.

- **send-discord-embed.mjs** - Utility for sending rich embed messages to Discord.

- **stream-discord-update.mjs** - Handles streaming Discord message updates for real-time notifications.

- **flush-discord-stream.mjs** - Flushes accumulated stream buffers to Discord.

- **stream-interval-ms.mjs** - Configuration constant for stream interval timing.

- **stream-max-length.mjs** - Configuration constant for maximum stream buffer length.

- **color-to-emoji.mjs** - Utility for converting color codes to Discord emoji representations.

- **logger.mjs** - Shared logger module for the notification system.

### test-discord Subdirectory

This subdirectory contains testing utilities for the notification system:

- **index.mjs** - Generated facade index exporting testing functions (`testVoiceAnnouncement`, `runTests`) and configuration constants.

- **runtime.mjs** - Runtime carry-forward module that imports and executes the main function.

- **openclaw-gateway-host.mjs** - Configuration constant for the OpenClaw gateway host URL (test environment).

- **openclaw-gateway-port.mjs** - Configuration constant for the OpenClaw gateway port (test environment).

- **openclaw-gateway-token.mjs** - Authentication token for the OpenClaw gateway (test environment).

- **test-voice-announcement.mjs** - Function for testing voice announcement functionality.

- **run-tests.mjs** - Main test runner for the Discord notification system.

- **logger.mjs** - Shared logger module for test utilities.

## 3. Overall Directory Function

This directory serves as the notification layer for the ANQR harness. The two main subdirectories work together to provide:

**openclaw-discord**: The primary notification system that sends messages to Discord via the OpenClaw gateway. It supports:
- Plain text messages
- Rich embed messages
- Streaming updates with buffer management
- Real-time message updates

**test-discord**: Testing utilities that verify the notification system works correctly, including voice announcement testing.

The notification system uses the OpenClaw gateway as a proxy to Discord, which allows for authenticated and rate-limited message sending. The streaming functionality enables real-time updates by buffering messages and flushing them at configured intervals.

## 4. Usage Instructions

This directory is primarily used through imports from other harness modules. The facade files are the canonical entry points:

```javascript
// Import notification functions
import { sendDiscordMessage, sendDiscordEmbed } from "./ops/integrations/notifications/openclaw-discord.mjs";

// Import test utilities
import { testVoiceAnnouncement, runTests } from "./ops/integrations/notifications/test-discord.mjs";
```

### Running Tests

To run the Discord notification tests:

```bash
node ops/integrations/notifications/test-discord/runtime.mjs
```

Or directly:

```bash
node ops/integrations/notifications/test-discord/run-tests.mjs
```

### Prerequisites

- OpenClaw gateway must be running and accessible
- Valid authentication token configured in environment or config files
- Discord channel ID for target notification channel

## 5. Dependencies

### Internal Dependencies

- **../../lib/logger.mjs** - Logger factory used across notification modules
- **../linear/linear-client.mjs** - Linear API client (potentially used for issue-related notifications)

### External Services

- **OpenClaw Gateway** - HTTP gateway for sending Discord messages
- **Discord API** - Platform for delivering notifications

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Network access to OpenClaw gateway
- Valid Discord bot token and channel permissions

## 6. Additional Comments

- **Streaming Design**: The notification system supports streaming updates via `streamDiscordUpdate` and `flushDiscordStream`, which buffers messages and sends them at configured intervals (`STREAM_INTERVAL_MS`) to avoid rate limiting.

- **Facade Pattern**: The directory uses a decomposition pattern where original files have been split into sibling modules, with facade files re-exporting from matching directories for backwards compatibility.

- **Test Environment**: The test-discord subdirectory provides a separate configuration for testing, allowing test notifications to be sent to different channels or gateways without affecting production.

- **Embed Support**: Rich embed messages allow for formatted notifications with titles, descriptions, colors, and fields, which is useful for status updates and alerts.

- **Buffer Management**: The `discordStreamBuffers` object manages streaming message state, enabling real-time updates for long-running operations.