# ANQR Notifications

## 1. Directory Overview

Notification modules for the ANQR (Agentic Number Query Runner) harness to send alerts via email and Discord. This directory provides the communication layer that enables the harness to notify users and systems about task status, completion, errors, and other important events.

## 2. File Summaries

### Root Level Files

- **README.md** - This file. Provides documentation for the notifications directory.

- **notify.mjs** - Auto-generated facade module that re-exports from `./notify/index.mjs` and `./notify/runtime.mjs`. Provides the CLI entry point for email notifications via msmtp with rate limiting and deduplication.

### Subdirectories

**notify/** - Email notification implementation:
- **index.mjs** - Main module exporting notification functions.
- **runtime.mjs** - Runtime execution for the notify CLI.
- Additional implementation files for email sending logic.

### Files Referenced in Documentation

- **openclaw-discord.mjs** - Located in `ops/integrations/notifications/`. Sends notifications to Discord channels via OpenClaw Gateway's hook API. Used by Symphony/Codebuff bridges to stream real-time updates during OpenClaw sessions.

## 3. Overall Directory Function

This directory serves as the notification layer for the ANQR harness. The files work together to provide multi-channel alerting capabilities:

- **Email Notifications**: The notify module sends email alerts via `msmtp`, with built-in rate limiting and deduplication to prevent notification spam. It respects the `ANQR_NOTIFY_EMAIL` environment variable for recipient configuration.

- **Discord Notifications**: Handled by the OpenClaw integration in `ops/integrations/notifications/`. Discord notifications are routed through OpenClaw Gateway instead of using webhooks directly, leveraging OpenClaw's Discord bot integration for richer messaging capabilities.

The notification system is integrated into the Symphony bridge to send asynchronous notifications when:
- A request starts processing (with issue context if available)
- A request completes successfully (with provider and summary)

Notifications are sent asynchronously and failures are logged but don't interrupt request processing.

## 4. Usage Instructions

### Email Notifications

Run the notify script with the email channel:

```bash
node harness/ops/notifications/notify.mjs --channel=email
```

With dry-run mode for testing:

```bash
node harness/ops/notifications/notify.mjs --channel=email --dry-run
```

### Discord Notifications

Discord notifications are integrated through OpenClaw Gateway. Import and use in code:

```javascript
import { streamDiscordUpdate, sendDiscordEmbed } from "./openclaw-discord.mjs";

// Simple text message
await streamDiscordUpdate("Task started", { emoji: "rocket" });

// Embedded message
await sendDiscordEmbed({
  title: "Task Completed",
  description: "Successfully processed request",
  color: 0x00ff00, // Green
  fields: [
    { name: "Provider", value: "codebuff", inline: true },
    { name: "Duration", value: "2.5s", inline: true },
  ],
});
```

Test Discord notification:

```bash
node -e "import('./openclaw-discord.mjs').then(m => m.sendDiscordMessage('Test notification from ANQR'))"
```

## 5. Dependencies

### Environment Variables

**Email Notifications:**
- `ANQR_NOTIFY_EMAIL` - Recipient email address (default: matthew.aldous@gmail.com)

**Discord via OpenClaw:**
- `OPENCLAW_GATEWAY_HOST` - OpenClaw Gateway host (default: 127.0.0.1)
- `OPENCLAW_GATEWAY_PORT` - OpenClaw Gateway port (default: 18789)
- `OPENCLAW_GATEWAY_TOKEN` - Token for OpenClaw Gateway authentication (required)
- `DISCORD_TEXT_CHANNEL_ID` - Discord text channel for notifications (default: 1486262758256410646)
- `DISCORD_VOICE_CHANNEL_ID` - Discord voice channel for voice interaction via TTS/STT (default: 1486262758256410647)

### Runtime Requirements

- **msmtp** - For email sending (system mail transfer agent)
- **OpenClaw Gateway** - Running and accessible for Discord notifications
- **Node.js** - ESM modules with .mjs extension

### External Services

- **Email** - Via msmtp to configured SMTP server
- **Discord** - Via OpenClaw Gateway bot integration

## 6. Additional Comments

**Architecture Note:** OpenClaw owns the Discord bot integration. Symphony routes Discord messages through OpenClaw Gateway instead of using webhooks directly. This provides richer message formatting and voice channel integration for TTS/STT functionality.

**Legacy Environment Variables:** The `DISCORD_WEBHOOK_URL` and `DISCORD_WEBHOOK_ENABLED` environment variables are no longer used. All Discord notifications are now routed through OpenClaw Gateway.

**Setup for Persistent Notifications:** To enable Discord notifications in production, add the OpenClaw Gateway token to the systemd service environment file at `services/systemd/anqr-ops.env` and restart the relevant services:

```bash
systemctl --user restart anqr-symphony-router
systemctl --user restart 'anqr-symphony-executor@*.service'
```

**Asynchronous Design:** Notifications are sent asynchronously and failures are logged but don't interrupt request processing. This ensures that notification delivery issues don't impact the main workflow execution.