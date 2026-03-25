# OpenClaw Memory

## User Preferences

### Discord Announcements
- **CRITICAL REQUIREMENT**: ALWAYS open response in chat GUI first, then stream progress updates to Discord
- **Why**: User is listening via Discord voice TTS when away from computer
- **Implementation**: 
  1. Send initial "Working on it..." message immediately (✅ implemented)
  2. Stream progress updates every 30 seconds during Symphony bridge processing (✅ implemented)
  3. Send completion message with summary (✅ implemented)
- **Context**: User can listen when away from computer and might respond
- **Use case**: Voice-based monitoring of long-running AI tasks
- **Date added**: 2026-03-25
- ✅ **Status**: Discord text notifications fully implemented in Symphony bridge
- ⚠️ **Voice announcements**: Removed from Symphony bridge - OpenClaw automatically speaks responses in Discord sessions

## Recent Configuration

### Discord Integration (2026-03-25 22:18 GMT+11)
✅ **Working features:**
1. **Discord text notifications**: Webhook integration to Discord text channel (1486262758256410646)
2. **Discord voice**: OpenClaw automatically speaks my responses when I reply in Discord sessions
3. **Linear issue formatting**: Embedded messages with status/provider fields
4. **Normal requests**: Simple text announcements
5. **Periodic progress**: Every 30s text updates
6. **Discord message monitoring**: Polls text channel for user input every 5 seconds

⚠️ **Voice Announcements Removed** (commit 74abc44a4):
- **Problem**: Symphony bridge runs outside Discord session context, so TTS tool calls don't reach Discord voice
- **Solution**: Removed all voice announcement calls from Symphony bridge
- **Why this is correct**: OpenClaw automatically speaks my responses when I reply in Discord sessions - no need for separate TTS calls
- **User experience**: When I respond in Discord, user will hear my voice naturally (OpenClaw handles this)
- **Symphony role**: Send Discord text notifications only (via webhook)

### Voice Setup (2026-03-25)
- ✅ Discord voice integration working
- ✅ Bot auto-joins voice channel (Guild: 1486262757543121021, Channel: 1486262758256410647)
- ✅ TTS configured with Microsoft (primary) + ElevenLabs (fallback)
- ✅ Two-way voice conversations operational
- ✅ OpenClaw speaks responses automatically in Discord sessions
- ⚠️ Web Chat Control UI has limited TTS playback (browser restrictions)

### Symphony Bridge Adaptive Provider Selection (2026-03-25)
- ✅ Implemented session-aware provider stickiness
- ✅ Paid providers (codex, codebuff-paid) are sticky until exhausted
- ✅ Free providers rotate after adaptive turn limits (base: 10, range: 3-25)
- ✅ Self-tuning system adjusts parameters based on observed performance
- ✅ Periodic evaluation cycles every 1 hour (changed from 6 hours per user request)
- ✅ Codebuff mode detection via X-Codebuff-Mode header
- ✅ Provider rankings cleared and starting fresh (2026-03-25 20:04 UTC+11)
- ✅ Symphony Bridge restarted (PID 1539625, commit 74abc44a4)
- ✅ Discord text notifications working via webhook
- ✅ Voice announcements removed - OpenClaw handles TTS automatically in Discord sessions

### Discord Webhook Integration (2026-03-25)
- ✅ Created `scripts/ops/notifications/discord-webhook.mjs` module
- ✅ Integrated with Symphony bridge for request notifications
- ✅ Webhook URL configured in `services/systemd/anqr-ops.env`
- ✅ Sends notifications when requests start and complete
- ✅ Discord text channel: 1486262758256410646
- ✅ Discord voice channel: 1486262758256410647 (for OpenClaw automatic TTS)
- 📝 Webhook URL: https://discord.com/api/webhooks/1486304408286527539/...

**Functions available:**
- `sendDiscordNotification(payload)` - Full structured webhook payload
- `sendDiscordMessage(message)` - Simple text message
- `sendDiscordEmbed({ title, description, ... })` - Rich embed
- `streamDiscordUpdate(message, { emoji, timestamp })` - Stream progress updates

### Discord Integration Protocol (2026-03-25 22:25)

**CRITICAL RULES**:

✅ **VOICE Channel (1486262758256410647)**:
- **USER**: LISTEN AND TALK in voice channel
- **BOT (1486261316820664462)**: LISTEN AND TALK in voice channel
- **RULE**: DO NOT TYPE TEXT MESSAGES IN VOICE CHANNEL

✅ **TEXT Channel (1486262758256410646)**:
- **USER**: READ AND TYPE in text channel
- **BOT (1486261316820664462)**: READ AND TYPE in text channel
- **WEBHOOK (1486304408286527539)**: Send text messages here
- **RULE**: DO NOT SEND VOICE/TTS TO TEXT CHANNEL

**Implementation** (commit 958cdc92a - BROKEN):
- ❌ `speakAnnouncement()` function uses OpenClaw Gateway `/tools/invoke` endpoint with `tts` tool
- ❌ `tts` tool generates audio files locally but DOES NOT play them in Discord voice
- ✅ Discord webhook for text messages to TEXT_CHANNEL_ID

**Root Cause (2026-03-25 23:13)**:

Discord voice playback depends on the Discord execution path, not just successful TTS generation. The Symphony bridge currently uses `/tools/invoke`, which bypasses that path.

**Recommended Implementation Path**:

Replace bare `/tools/invoke` TTS calls with a normal OpenClaw response execution path, using Discord-aware context/session headers so the response can be delivered through Discord's voice pipeline.

**Hypothesis**:
If `/v1/responses` speaks in Discord and `/tools/invoke` does not, the hypothesis is confirmed.

**What is Proven**:
- ✅ Discord voice output works for native Discord interactions
- ❌ Bridge-triggered `/tools/invoke` TTS does not produce audible Discord voice output
- ⚠️ `sessions_list` does not expose a usable Discord session in the observed tests

**What Remains Unproven**:
- Whether Discord sessions are ephemeral
- Whether they are internal-only
- Whether there is a separate API path that can target them

**Implementation Status** (2026-03-25 23:31):

✅ **Code Updated**: Symphony bridge now uses OpenClaw Gateway `message` tool with Discord channel targeting
⏳ **Service Restart**: Need to restart Symphony bridge to test
⏳ **Testing Required**: User needs to test if voice announcements work in Discord by triggering a Symphony bridge request

**Code Changes** (Latest):
- `speakAnnouncement()` now calls `http://127.0.0.1:18789/tools/invoke` with `message` tool
- Args: `{ action: "send", channel: "discord", to: "1486262758256410647", message: "<text>" }`
- Direct channel targeting instead of session-based routing

**Hypothesis**:
If the `message` tool with Discord voice channel ID speaks in Discord voice, the direct channel targeting approach is confirmed.

**Voice announcements** (attempted but not working):
- **Target**: Send voice to Discord voice channel 1486262758256410647
- **Status**: ❌ NOT WORKING - `/v1/responses` endpoint does not exist
- **Implementation**: Uses `/v1/responses` with Discord context headers (Commit d43844ee1)
- **Linear issues**: "Working on ISSUE-ID" → "ISSUE-ID: N minutes" (every 2 min) → "ISSUE-ID done"
- **Normal requests**: "Processing request" → "N minutes elapsed" (every 2 min) → "Request complete"

**Text notifications** (working via webhook):
- ✅ Progress updates every 30 seconds
- ✅ Embedded messages for Linear issues
- ✅ Simple messages for normal requests
- ✅ Sent to Discord text channel 1486262758256410646

**Symphony Bridge**: Restarted successfully (PID 1601622, commit ea9462c92)

## Technical Notes

### Symphony Bridge Provider Routing
- **Port**: 4319 (OpenAI-compatible HTTP gateway)
- **Codebuff Bridge**: 4318 (with paid→free fallback)
- **Provider Cascade**: 38 providers across 4 tiers (paid, free-cloud, local-proxy, local-safety-net)
- **Transparent SSE Relay**: Preserves real-time Codebuff streaming without AI SDK buffering
- **Session State**: In-memory tracking for provider stickiness and turn counts
- **Adaptive Tuning**: Every 50 requests, adjusts turn limits based on success rates
- **Evaluation Cycle**: Every 200 requests OR 1 hour (whichever comes first, updated 2026-03-25)
- **All-Provider Sampling**: During evaluation cycle, force-sample the most underused provider (by time since use + selection count)
- **Tool Availability**: OpenClaw tools (`message`, `memory_get`, `read`) are NOT available in Codebuff bridge context - they're session-specific

### Codebuff Bridge Tool Proxying (Implemented 2026-03-25)
✅ **Implementation Complete**: Codebuff bridge now proxies OpenClaw-specific tools back to OpenClaw Gateway API

**Architecture**: Codebuff → OpenClaw Gateway `/tools/invoke` (stateless HTTP proxy)

**Implementation Details**:
1. ✅ Symphony bridge forwards `X-OpenClaw-Session` header to Codebuff bridge (line 1481)
2. ✅ Codebuff bridge extracts session ID from `X-OpenClaw-Session` request header
3. ✅ Codebuff bridge calls OpenClaw Gateway `/tools/invoke` endpoint (corrected from `/v1/tools/execute`)
4. ✅ Request format: `{ tool, args, sessionKey }` - Response: `{ ok, result }` or `{ ok: false, error }`
5. ✅ Proxied tools: `message`, `memory_get`, `read`, `write`, `exec`
6. ✅ Tool proxy function `proxyToolToOpenClaw` passed to Codebuff SDK via `proxyToolFn` parameter
7. ✅ Full integration with streaming and non-streaming modes

**Configuration** (Environment variables for Codebuff bridge):
- `OPENCLAW_GATEWAY_HOST` - Gateway hostname (default: 127.0.0.1)
- `OPENCLAW_GATEWAY_PORT` - Gateway port (default: 18789)
- `OPENCLAW_GATEWAY_TOKEN` - Gateway bearer token (optional, for auth)
- `OPENCLAW_TOOL_PROXY_ENABLED` - Enable/disable proxy (default: true)

**Request Flow**:
1. OpenClaw sends chat request to Symphony bridge (port 4319) with `X-OpenClaw-Session` header
2. Symphony credit-gate selects Codebuff and uses transparent SSE relay
3. Symphony forwards `X-OpenClaw-Session` header to Codebuff bridge (port 4318)
4. Codebuff bridge passes session ID and `proxyToolFn` to Codebuff SDK
5. When Codebuff SDK calls OpenClaw-specific tools, `proxyToolFn` intercepts
6. Bridge proxies HTTP POST to OpenClaw Gateway `/tools/invoke` with `{ tool, args, sessionKey }`
7. Gateway validates session, executes tool, returns `{ ok: true, result }` or `{ ok: false, error }`
8. Result flows back: Gateway → Codebuff SDK → Bridge SSE → Symphony → OpenClaw

**Status**: Ready for testing. Bridges need restart to apply changes.
