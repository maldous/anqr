# ANQR OpenClaw Discord Notifications

## 1. Directory Overview

This directory contains Discord notification integration utilities for the ANQR (Agentic Number
Query Runner) harness. It provides functionality to send messages, embeds, and streaming updates to
Discord channels via the OpenClaw Gateway. The module serves as the notifications layer within the
broader integration system, enabling the harness to communicate operational events and status
updates to Discord. It currently contains 15 files and 0 subdirectories.

## 2. File Summaries

### Files

- **color-to-emoji.mjs** - Utility that maps color codes to emoji indicators: `0x00ff00` (green) to "green circle", `0xff0000` (red) to "red circle", `0xffa500` (orange) to "orange circle".
- **discord-stream-buffers.mjs** - Global Map storing per-request streaming buffer state. Each entry contains `buffer` (accumulated text), `timer` (flush timeout), `replyTo`, `threadName`, and `source` options.
- **discord-text-channel-id.mjs** - Exports the target Discord text channel ID, defaulting to `1486262758256410646`. Configurable via `DISCORD_TEXT_CHANNEL_ID` environment variable.
- **flush-discord-stream.mjs** - Flushes a request's buffer to Discord, optionally with emoji prefix and timestamp suffix. Handles truncation for Discord's 2000 character limit. Clears buffer after sending.
- **index.mjs** - Generated facade index that re-exports all public API members: configuration constants, stream buffers, and messaging functions.
- **logger.mjs** - Shared logger module using the project's standard logger from `../../../lib/logger.mjs`. Exports `logDebug` and `logWarn` functions.
- **openclaw-gateway-host.mjs** - Exports the OpenClaw Gateway host address, defaulting to `127.0.0.1`. Configurable via `OPENCLAW_GATEWAY_HOST` environment variable.
- **openclaw-gateway-port.mjs** - Exports the OpenClaw Gateway port, defaulting to `18789`. Configurable via `OPENCLAW_GATEWAY_PORT` environment variable.
- **openclaw-gateway-token.mjs** - Exports the OpenClaw Gateway authentication token from `OPENCLAW_GATEWAY_TOKEN` environment variable. Required for sending messages.
- **send-discord-embed.mjs** - Constructs and sends formatted Discord embeds with title, description, fields, and footer. Converts color codes to emojis (green=success, red=error, orange=warning). Handles inline vs block field formatting.
- **send-discord-message.mjs** - Simple wrapper around `sendViaOpenClaw` for sending plain text messages. Validates non-empty content before sending.
- **send-via-open-claw.mjs** - Core function that sends content to Discord via the OpenClaw Gateway's `/tools/invoke` endpoint. Handles authentication, message construction, thread/reply options, and HTTP communication with timeout handling. Returns `{ sent: boolean, reason?: string }`.
- **stream-discord-update.mjs** - Accumulates text into per-request buffers and schedules periodic flushing. Sends immediately when buffer exceeds `STREAM_MAX_LENGTH`. Stores thread/reply options with buffer for use during flush.
- **stream-interval-ms.mjs** - Exports the streaming flush interval: `1000`ms.
- **stream-max-length.mjs** - Exports the maximum buffer length before immediate flush: `1900` characters.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./index.mjs";
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory exposes a public API through `index.mjs`.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
