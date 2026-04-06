# ANQR OpenClaw Discord Notifications

## 1. Directory Overview

This directory contains Discord notification integration utilities for the ANQR (Agentic Number Query Runner) harness. It provides functionality to send messages, embeds, and streaming updates to Discord channels via the OpenClaw Gateway. The module serves as the notifications layer within the broader integration system, enabling the harness to communicate operational events and status updates to Discord.

## 2. File Summaries

### Configuration Files

- **openclaw-gateway-host.mjs** - Exports the OpenClaw Gateway host address, defaulting to `127.0.0.1`. Configurable via `OPENCLAW_GATEWAY_HOST` environment variable.

- **openclaw-gateway-port.mjs** - Exports the OpenClaw Gateway port, defaulting to `18789`. Configurable via `OPENCLAW_GATEWAY_PORT` environment variable.

- **openclaw-gateway-token.mjs** - Exports the OpenClaw Gateway authentication token from `OPENCLAW_GATEWAY_TOKEN` environment variable. Required for sending messages.

- **discord-text-channel-id.mjs** - Exports the target Discord text channel ID, defaulting to `1486262758256410646`. Configurable via `DISCORD_TEXT_CHANNEL_ID` environment variable.

### Core Messaging Functions

- **send-via-open-claw.mjs** - Core function that sends content to Discord via the OpenClaw Gateway's `/tools/invoke` endpoint. Handles authentication, message construction, thread/reply options, and HTTP communication with timeout handling. Returns `{ sent: boolean, reason?: string }`.

- **send-discord-message.mjs** - Simple wrapper around `sendViaOpenClaw` for sending plain text messages. Validates non-empty content before sending.

- **send-discord-embed.mjs** - Constructs and sends formatted Discord embeds with title, description, fields, and footer. Converts color codes to emojis (green=success, red=error, orange=warning). Handles inline vs block field formatting.

- **color-to-emoji.mjs** - Utility that maps color codes to emoji indicators: `0x00ff00` (green) to "green circle", `0xff0000` (red) to "red circle", `0xffa500` (orange) to "orange circle".

### Streaming Utilities

- **discord-stream-buffers.mjs** - Global Map storing per-request streaming buffer state. Each entry contains `buffer` (accumulated text), `timer` (flush timeout), `replyTo`, `threadName`, and `source` options.

- **stream-interval-ms.mjs** - Exports the streaming flush interval: `1000`ms.

- **stream-max-length.mjs** - Exports the maximum buffer length before immediate flush: `1900` characters.

- **stream-discord-update.mjs** - Accumulates text into per-request buffers and schedules periodic flushing. Sends immediately when buffer exceeds `STREAM_MAX_LENGTH`. Stores thread/reply options with buffer for use during flush.

- **flush-discord-stream.mjs** - Flushes a request's buffer to Discord, optionally with emoji prefix and timestamp suffix. Handles truncation for Discord's 2000 character limit. Clears buffer after sending.

### Index and Logger

- **index.mjs** - Generated facade index that re-exports all public API members: configuration constants, stream buffers, and messaging functions.

- **logger.mjs** - Shared logger module using the project's standard logger from `../../../lib/logger.mjs`. Exports `logDebug` and `logWarn` functions.

## 3. Overall Directory Function

This directory provides a complete Discord notification system that integrates with the OpenClaw Gateway. The files work together to enable:

- **Direct messaging** - Send plain text messages to Discord via `sendDiscordMessage`
- **Formatted embeds** - Send structured messages with titles, descriptions, fields, and color-coded status via `sendDiscordEmbed`
- **Streaming updates** - Accumulate and periodically flush message chunks via `streamDiscordUpdate` and `flushDiscordStream`

The architecture follows a pattern where `sendViaOpenClaw` is the central HTTP communication layer, wrapping the OpenClaw Gateway's tool invocation API. Configuration is environment-driven with sensible defaults, enabling flexible deployment without code changes.

The streaming functionality supports real-time progress updates by buffering content and flushing at intervals or when size limits are reached, which is useful for long-running operations that want to provide incremental status to Discord.

## 4. Usage Instructions

### Sending a Simple Message

```javascript
import { sendDiscordMessage } from "./ops/integrations/notifications/openclaw-discord/index.mjs";

const result = await sendDiscordMessage("Operation completed successfully");
console.log(result); // { sent: true }
```

### Sending an Embed

```javascript
import { sendDiscordEmbed } from "./ops/integrations/notifications/openclaw-discord/index.mjs";

const result = await sendDiscordEmbed({
  title: "Deployment Status",
  description: "Production deployment completed",
  fields: [
    { name: "Environment", value: "production", inline: true },
    { name: "Duration", value: "2m 30s", inline: true },
  ],
  color: 0x00ff00, // green for success
  footer: "via ANQR",
});
```

### Streaming Updates

```javascript
import { streamDiscordUpdate, flushDiscordStream } from "./ops/integrations/notifications/openclaw-discord/index.mjs";

// Accumulate updates
await streamDiscordUpdate("Processing... ", { requestId: "deploy-123" });
await streamDiscordUpdate("50% complete", { requestId: "deploy-123" });
await streamDiscordUpdate("100% done", { requestId: "deploy-123" });

// Flush the buffer
await flushDiscordStream({ emoji: "Deploy", timestamp: true, requestId: "deploy-123" });
```

### Configuration

Set environment variables before use:

```bash
export OPENCLAW_GATEWAY_HOST="127.0.0.1"
export OPENCLAW_GATEWAY_PORT="18789"
export OPENCLAW_GATEWAY_TOKEN="your-token-here"
export DISCORD_TEXT_CHANNEL_ID="1486262758256410646"
```

## 5. Dependencies

### Internal Dependencies

- **../../../lib/logger.mjs** - Shared logging infrastructure (`createLogger`)

### Runtime Requirements

- **Node.js** - ESM modules with .mjs extension
- **OpenClaw Gateway** - Must be running and accessible at configured host:port
- **Valid authentication token** - Required in `OPENCLAW_GATEWAY_TOKEN`

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENCLAW_GATEWAY_TOKEN` | Yes | none | Authentication token for OpenClaw Gateway |
| `OPENCLAW_GATEWAY_HOST` | No | `127.0.0.1` | OpenClaw Gateway hostname |
| `OPENCLAW_GATEWAY_PORT` | No | `18789` | OpenClaw Gateway port |
| `DISCORD_TEXT_CHANNEL_ID` | No | `1486262758256410646` | Discord channel for notifications |

## 6. Additional Comments

- **Graceful Degradation**: If `OPENCLAW_GATEWAY_TOKEN` is not set, all send functions return `{ sent: false, reason: "OPENCLAW_GATEWAY_TOKEN not set" }` without throwing errors. This allows the system to continue operating even when Discord notifications are not configured.

- **HTTP Timeout**: All HTTP requests have a 15-second timeout to prevent indefinite hangs.

- **Character Limits**: Discord messages are capped at 2000 characters. The streaming system truncates content with "..." if it exceeds this limit after adding prefix/suffix.

- **Thread and Reply Support**: The module supports sending to Discord threads (via `threadName`) and replying to specific messages (via `replyTo`), enabling rich conversational integration.

- **Buffer Management**: Each streaming request gets its own isolated buffer, identified by `requestId`. This allows multiple concurrent streaming operations without interference.

- **Color-to-Emoji Mapping**: The color mapping provides visual status indication in plain text messages where actual Discord embeds are not used, using Unicode emoji characters.