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

### Discord Webhook (`discord-webhook.mjs`)

Sends notifications to Discord channels via webhooks. Used by Symphony/Codebuff bridges to stream real-time updates during OpenClaw sessions.

**Environment Variables:**
- `DISCORD_WEBHOOK_URL` - Discord webhook URL (required)
- `DISCORD_WEBHOOK_ENABLED` - Enable/disable webhook (default: true if URL set)

**Setup:**

1. **Create a Discord webhook:**
   - Open Discord server settings
   - Go to Integrations → Webhooks
   - Click "New Webhook"
   - Select the target channel (e.g., `#openclaw-updates`)
   - Copy the webhook URL

2. **Set environment variable:**
   ```bash
   export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN"
   ```

3. **Add to systemd service (for persistent notifications):**
   
   Edit `services/systemd/anqr-ops.env`:
   ```bash
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
   ```

4. **Restart bridges to apply:**
   ```bash
   systemctl --user restart anqr-symphony-bridge
   systemctl --user restart anqr-codebuff-bridge
   ```

**Usage in code:**

```javascript
import { streamDiscordUpdate, sendDiscordEmbed } from './discord-webhook.mjs';

// Simple text message
await streamDiscordUpdate("🚀 Task started", { emoji: "🚀" });

// Embedded message with formatting
await sendDiscordEmbed({
  title: "Task Completed",
  description: "Successfully processed request",
  color: 0x00FF00, // Green
  fields: [
    { name: "Provider", value: "codebuff", inline: true },
    { name: "Duration", value: "2.5s", inline: true }
  ]
});
```

**Integration:**

The Discord webhook is integrated into the Symphony bridge to send notifications when:
- A request starts processing (with issue context if available)
- A request completes successfully (with provider and summary)

Notifications are sent asynchronously and failures are logged but don't interrupt request processing.

## Testing

Test Discord webhook:
```javascript
node -e "import('./discord-webhook.mjs').then(m => m.sendDiscordMessage('Test notification from ANQR 🤖'))"
```

Test email notification:
```bash
node scripts/ops/notifications/notify.mjs --channel=email --dry-run
```
