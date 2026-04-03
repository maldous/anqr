# Discord Voice Integration

## Architecture Overview

ANQR's Discord integration consists of two distinct components, plus voice-aware features in the Symphony bridge.

### 0. OpenClaw Gateway (standalone service)

- `openclaw-gateway.service` runs a single OpenClaw Gateway instance on port 18789.
- The gateway is managed by systemd directly with `Restart=always` — no lock-based singleton pattern needed.
- OpenClaw owns the Discord bot connection and routes inbound messages to the Symphony bridge provider.
- The `~/.openclaw/openclaw.json` config controls Discord channel access via `channels.discord.guilds` allowlist.
- **Update path:** `systemctl --user restart openclaw-gateway.service`

### 1. Discord Notifications via OpenClaw (ANQR-owned)

**Location**: `scripts/ops/integrations/notifications/openclaw-discord.mjs`

**Architecture**: OpenClaw owns the Discord bot integration. Symphony routes Discord messages through OpenClaw Gateway instead of using webhooks directly.

**Capabilities**:

- Send text notifications to Discord channels via OpenClaw Gateway hook API
- Send embedded messages with formatting (converted to markdown)
- Stream progress updates with batching (every 1s or 1900 chars)
- Per-request buffering to prevent message mixing
- Session-aware routing via `channel: "last"`

**Environment Variables**:

- `OPENCLAW_GATEWAY_HOST` - OpenClaw Gateway host (default: 127.0.0.1)
- `OPENCLAW_GATEWAY_PORT` - OpenClaw Gateway port (default: 18789)
- `OPENCLAW_GATEWAY_TOKEN` - Token for OpenClaw Gateway authentication (required)
- `DISCORD_TEXT_CHANNEL_ID` - Discord text channel for notifications (default: 1486262758256410646)
- `DISCORD_VOICE_CHANNEL_ID` - Discord voice channel for voice interaction (default: 1486262758256410647)

**Note**: `DISCORD_WEBHOOK_URL` and `DISCORD_WEBHOOK_ENABLED` are no longer used. Discord notifications are now routed through OpenClaw Gateway.

**OpenClaw guilds allowlist** (`~/.openclaw/openclaw.json`): Both channels are in the `channels.discord.guilds` allowlist. The **text channel** handles text commands/responses. The **voice channel** handles voice interaction — the bot listens to speech (STT) and replies via TTS. Symphony can send voice updates to the voice channel via OpenClaw's `message` tool.

**Scope**: Text-only notifications. Does NOT include bot capabilities or voice channel access.

### 2. Discord Bot with Voice (OpenClaw Gateway-owned)

**Location**: External service (port 18789), managed outside ANQR repository

**Capabilities**:

- Full Discord bot functionality via OpenClaw's `message` tool
- Voice channel joining and TTS announcements
- Discord.js integration with voice dependencies

**Configuration Required**:

- Discord bot token in OpenClaw Gateway configuration
- Bot permissions: Connect, Speak (in Discord server settings)
- Bot intents: GUILD_VOICE_STATES
- Dependencies: `@discordjs/voice`, `libsodium-wrappers`, `ffmpeg`

**Scope**: Managed externally. ANQR code can _invoke_ voice features via OpenClaw Gateway but cannot configure them.

## Symphony Bridge Voice Features

The Symphony bridge (`symphony-openai-bridge.mjs`) includes several voice-aware features:

### Voice Announcements

`voiceAnnounce(text)` is a fire-and-forget wrapper around `voiceSpeakTool()` that announces major bridge events via voice. Non-blocking — silently ignores failures (e.g., no voice session active).

**Events announced:**

- **Bridge startup:** "Symphony bridge is online."
- **New request:** "Starting work on [issue title or task description]."
- **Request completion:** "Finished [issue title or task]." (all 3 paths: codebuff direct, streaming, non-streaming)

### Voice-Friendly System Prompt

When a request originates from a Discord voice channel (detected by matching OpenClaw's `"Voice transcript from speaker ..."` prompt format via `VOICE_TRANSCRIPT_RE`), the bridge injects `VOICE_SYSTEM_PROMPT` into the messages array. This instructs the LLM to:

- Respond in natural, conversational spoken language only
- Never use code blocks, inline code, markdown, bullet points, or numbered lists
- Never include URLs, file paths, or technical symbols
- Keep responses brief — a few sentences at most

The voice system prompt is placed after existing system messages for proper precedence.

### Voice Noise Filter

`isVoiceNoise(text)` filters operational noise from being spoken:

- Provider failure/retry messages
- Rate limit warnings
- Probe results
- Stack traces and error dumps
- Bridge status messages

### Text-to-Speech Sanitizer

`sanitizeTextForSpeech(text)` is a 13-step pipeline that humanizes text for TTS:

1. Strip fenced code blocks → "code block omitted"
2. Strip inline HTML tags
3. Strip markdown links (keep link text)
4. Simplify inline code (keep short names, replace complex code with "code")
5. URLs → "a link"
6. File paths → just the filename
7. Markdown headers → plain text
8. Bold/italic markers removed
9. Emoji stripped
10. Special chars that sound bad when read aloud removed
11. Collapse whitespace
12. Truncate at 500 chars (on word boundary)
13. Final trim

### Voice Speak Tool

`voiceSpeakTool({ text, guildId })` applies the noise filter + sanitizer before sending text to the OpenClaw Gateway's `/tools/invoke` endpoint for TTS playback.

## Testing Voice Functionality

The test script `scripts/ops/integrations/notifications/test-discord.mjs` includes a voice announcement test that calls OpenClaw Gateway's message tool.

**Prerequisites**:

1. OpenClaw Gateway must be running (port 18789)
2. `OPENCLAW_GATEWAY_TOKEN` environment variable must be set
3. OpenClaw must have Discord bot configured with voice capabilities
4. Discord bot must have proper permissions and intents

**Expected Behavior**:

- If `OPENCLAW_GATEWAY_TOKEN` is not set: Test skipped with clear message
- If OpenClaw Gateway is not reachable: HTTP error
- If Discord bot lacks voice permissions: OpenClaw error response
- If successful: Voice announcement played in Discord channel

## Troubleshooting Voice Issues

### Issue: "Discord bot not joining voice channel"

**Root Cause**: This is NOT an ANQR code issue. Voice functionality depends on:

1. **OpenClaw Gateway Configuration**:
   - Discord bot must be configured in OpenClaw Gateway
   - Bot must have voice dependencies installed
   - Bot token must be valid

2. **Discord Server Permissions**:
   - Bot must be invited to the server
   - Bot must have "Connect" permission
   - Bot must have "Speak" permission
   - Voice channel ID must be correct

3. **Discord Bot Intents**:
   - `GUILD_VOICE_STATES` intent must be enabled in Discord Developer Portal

**Resolution Steps**:

1. Verify OpenClaw Gateway is running:

   ```bash
   curl http://127.0.0.1:18789/health
   ```

2. Check OpenClaw Gateway has Discord bot configured:
   - Review OpenClaw configuration files
   - Ensure Discord bot token is set
   - Verify voice dependencies are installed

3. Verify Discord server permissions:
   - Check bot role has Connect and Speak permissions
   - Ensure bot is in the target voice channel or has permission to join

4. Check Discord Developer Portal:
   - Ensure GUILD_VOICE_STATES intent is enabled
   - Regenerate bot token if needed

5. Test OpenClaw message tool directly:
   ```bash
   curl -X POST http://127.0.0.1:18789/tools/invoke \
     -H "Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "tool": "message",
       "args": {
         "action": "send",
         "message": "Test voice announcement",
         "channel": "discord",
         "to": "VOICE_CHANNEL_ID"
       }
     }'
   ```

## Scope Boundaries

| Component                  | Owned By         | Repository               | Can Modify |
| -------------------------- | ---------------- | ------------------------ | ---------- |
| Discord via OpenClaw       | ANQR Harness     | anqr                     | ✅ Yes     |
| Voice bot configuration    | OpenClaw Gateway | External                 | ❌ No      |
| Voice bot dependencies     | OpenClaw Gateway | External                 | ❌ No      |
| Discord server permissions | Human operators  | Discord UI               | ❌ No      |
| Bot intents                | Human operators  | Discord Developer Portal | ❌ No      |

## Related Files

- `scripts/ops/integrations/notifications/openclaw-discord.mjs` - Discord integration via OpenClaw
- `scripts/ops/integrations/notifications/test-discord.mjs` - Integration tests
- `.openclaw/openclaw.json` - OpenClaw Gateway configuration
- `docs/harness/02-runtime-and-services.md` - Service documentation
- `knowledge.md` - Service restart procedures and Discord streaming behavior

---

## Related Exports

All voice functions and constants are exported from `symphony-openai-bridge.mjs` for testability:

- `voiceSpeakTool` — Main tool for speaking text via OpenClaw
- `voiceAnnounce` — Fire-and-forget event announcer
- `isVoiceNoise` — Noise filter predicate
- `sanitizeTextForSpeech` — 13-step TTS sanitizer
- `VOICE_TRANSCRIPT_RE` — Regex for detecting voice-originated requests
- `VOICE_SYSTEM_PROMPT` — System prompt for voice-friendly responses

---

_Last updated: 2026-04-02_
