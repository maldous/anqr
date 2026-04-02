# ANQR Notifications

Notification modules for the ANQR harness to send alerts via email and Discord.

## Modules

### Email Notifications (`notify.mjs`, `notify-impl.mjs`)

Sends email notifications via `msmtp` with rate limiting and deduplication.

**Environment Variables:**

- `ANQR_NOTIFY_EMAIL` - Recipient email address (default: matthew.aldous@gmail.com)

**Usage:**

```bash
node scripts/ops/notifications/notify.mjs --channel=email
```

### Discord via OpenClaw (`openclaw-discord.mjs`)

Sends notifications to Discord channels via OpenClaw Gateway's hook API. Used by Symphony/Codebuff bridges to stream real-time updates during OpenClaw sessions.

**Architecture:** OpenClaw owns the Discord bot integration. Symphony routes Discord messages through OpenClaw Gateway instead of using webhooks directly.

**Environment Variables:**

- `OPENCLAW_GATEWAY_HOST` - OpenClaw Gateway host (default: 127.0.0.1)
- `OPENCLAW_GATEWAY_PORT` - OpenClaw Gateway port (default: 18789)
- `OPENCLAW_GATEWAY_TOKEN` - Token for OpenClaw Gateway authentication (required)
- `DISCORD_TEXT_CHANNEL_ID` - Discord text channel for notifications (default: 1486262758256410646)
- `DISCORD_VOICE_CHANNEL_ID` - Discord voice channel for voice interaction via TTS/STT (default: 1486262758256410647)

**Setup:**

1. **Ensure OpenClaw Gateway is running:**
   The OpenClaw Gateway handles Discord bot integration. Ensure it's running and accessible.

2. **Set environment variables:**

   ```bash
   export OPENCLAW_GATEWAY_TOKEN="your-openclaw-gateway-token"
   ```

3. **Add to systemd service (for persistent notifications):**

   Edit `services/systemd/anqr-ops.env`:

   ```bash
   OPENCLAW_GATEWAY_TOKEN=your-openclaw-gateway-token
   ```

4. **Restart services to apply:**
   ```bash
   systemctl --user restart anqr-symphony-router
   systemctl --user restart 'anqr-symphony-executor@*.service'
   ```

**Note:** The `DISCORD_WEBHOOK_URL` and `DISCORD_WEBHOOK_ENABLED` environment variables are no longer used. Discord notifications are now routed through OpenClaw Gateway.

**Usage in code:**

```javascript
import { streamDiscordUpdate, sendDiscordEmbed } from "./openclaw-discord.mjs";

// Simple text message
await streamDiscordUpdate("🚀 Task started", { emoji: "🚀" });

// Embedded message with formatting
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

**Integration:**

The Discord notifications via OpenClaw are integrated into the Symphony bridge to send notifications when:

- A request starts processing (with issue context if available)
- A request completes successfully (with provider and summary)

Notifications are sent asynchronously and failures are logged but don't interrupt request processing.

## Testing

Test Discord via OpenClaw:

```javascript
node -e "import('./openclaw-discord.mjs').then(m => m.sendDiscordMessage('Test notification from ANQR 🤖'))"
```

Test email notification:

```bash
node scripts/ops/notifications/notify.mjs --channel=email --dry-run
```
