# OpenClaw Memory

## User Preferences

### Discord Announcements
- **CRITICAL REQUIREMENT**: ALWAYS open response in chat GUI first, then stream progress updates to Discord
- **Why**: User is listening via Discord voice TTS when away from computer
- **Implementation**: 
  1. Send initial "Working on it..." message immediately (✅ implemented)
  2. Stream progress updates every 30 seconds during Symphony bridge processing (✅ implemented)
  3. Voice announcements every 2 minutes via OpenClaw TTS (✅ implemented)
  4. Send completion message with summary (✅ implemented)
- **Context**: User can listen when away from computer and might respond
- **Use case**: Voice-based monitoring of long-running AI tasks
- **Date added**: 2026-03-25
- **Updated**: 2026-03-25 21:21 GMT+11 - Fixed voice announcements to be task-focused only
- ✅ **Status**: Fully implemented in Symphony bridge
- ⚠️ **Note**: `message` tool not available in web chat context (can only send from Discord channel)

**Voice Announcement Format** (2026-03-25 21:21 GMT+11):
- Start: "Working on ISSUE-ID" (simple, no conversational text)
- Progress: "Still working on ISSUE-ID. N minutes elapsed." (every 2 minutes)
- Complete: "ISSUE-ID is done." (simple, no conversational text)
- Fixed: No more "you're welcome" or conversational fluff in voice announcements

## Recent Configuration

### Voice Setup (2026-03-25)
- ✅ Discord voice integration working
- ✅ Bot auto-joins voice channel (Guild: 1486262757543121021, Channel: 1486262758256410647)
- ✅ TTS configured with Microsoft (primary) + ElevenLabs (fallback)
- ✅ Two-way voice conversations operational
- ⚠️ Web Chat Control UI has limited TTS playback (browser restrictions)



### Symphony Bridge Adaptive Provider Selection (2026-03-25)
- ✅ Implemented session-aware provider stickiness
- ✅ Paid providers (codex, codebuff-paid) are sticky until exhausted
- ✅ Free providers rotate after adaptive turn limits (base: 10, range: 3-25)
- ✅ Self-tuning system adjusts parameters based on observed performance
- ✅ Periodic evaluation cycles every 1 hour (changed from 6 hours per user request)
- ✅ Codebuff mode detection via X-Codebuff-Mode header
- ✅ Provider rankings cleared and starting fresh (2026-03-25 20:04 UTC+11)
- ✅ Symphony Bridge restarted successfully (PID 1451490, 2026-03-25 21:11 UTC+11)
- ✅ Discord webhook integration active (channel: 1486262758256410646)

### Discord Webhook Integration (2026-03-25)
- ✅ Created `scripts/ops/notifications/discord-webhook.mjs` module
- ✅ Integrated with Symphony bridge for request notifications
- ✅ Webhook URL configured in `services/systemd/anqr-ops.env`
- ✅ Sends notifications when requests start and complete
- ✅ Discord channel: 1486262758256410646 (text)
- 📝 Webhook URL: https://discord.com/api/webhooks/1486304408286527539/...

**Functions available:**
- `sendDiscordNotification(payload)` - Full structured webhook payload
- `sendDiscordMessage(message)` - Simple text message
- `sendDiscordEmbed({ title, description, ... })` - Rich embed
- `streamDiscordUpdate(message, { emoji, timestamp })` - Stream progress updates

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

**Architecture**: Codebuff → OpenClaw Gateway `/v1/tools/execute` (stateless HTTP proxy)

**Implementation Details**:
1. ✅ Symphony bridge forwards `X-OpenClaw-Session` header to Codebuff bridge
2. ✅ Codebuff bridge extracts session ID from request headers
3. ✅ Tool proxy function `callOpenClawGatewayTool` implemented with 30s timeout
4. ✅ Proxied tools: `message`, `memory_get`, `read`, `write`, `exec`
5. ✅ Integrated with Codebuff SDK via `proxyToolFn` parameter (both streaming and non-streaming)
6. ✅ Error handling with ERR_HTTP_HEADERS_SENT fix applied
7. ✅ Environment variable validation on startup

**Configuration** (Environment variables for Codebuff bridge):
- `OPENCLAW_GATEWAY_URL` - Full gateway URL (default: http://127.0.0.1:18789)
- `OPENCLAW_GATEWAY_HOST` - Gateway hostname (default: 127.0.0.1)
- `OPENCLAW_GATEWAY_PORT` - Gateway port (default: 18789)
- `OPENCLAW_GATEWAY_TOKEN` - Gateway bearer token (required for tool proxying)
- `OPENCLAW_TOOL_PROXY_ENABLED` - Enable/disable proxy (default: true)

**Request Flow**:
1. OpenClaw sends chat request to Symphony bridge (port 4319) with `X-OpenClaw-Session` header
2. Symphony credit-gate selects Codebuff and uses transparent SSE relay
3. Symphony forwards `X-OpenClaw-Session` header to Codebuff bridge (port 4318)
4. Codebuff bridge extracts session ID and passes `proxyToolFn` to Codebuff SDK
5. When Codebuff SDK calls OpenClaw-specific tools, `proxyToolFn` intercepts and calls `callOpenClawGatewayTool`
6. Bridge proxies HTTP POST to OpenClaw Gateway `/v1/tools/execute` with `{ tool, input, sessionId }`
7. Gateway validates session, executes tool, returns result or error
8. Result flows back: Gateway → Codebuff SDK → Bridge SSE → Symphony → OpenClaw

**Status**: ✅ **Active** - Both bridges restarted and running (committed 2026-03-25)

**Critical Fixes Applied**:
- Fixed ERR_HTTP_HEADERS_SENT crash in Symphony bridge error handling
- Removed duplicate imports and function definitions in Codebuff bridge
- Fixed endpoint path to `/v1/tools/execute`
- Added proper timeout handling (30s) with cleanup
- Improved error messages with session ID truncation
- Added startup validation for OPENCLAW_GATEWAY_TOKEN

### Discord Webhook Integration (Implemented 2026-03-25)
✅ **Implementation Complete**: Symphony bridge now sends real-time notifications to Discord

**Features:**
- Sends notification when request starts (with issue context if available)
- Sends notification when request completes (with provider and result summary)
- Non-blocking async notifications (failures logged but don't interrupt requests)
- Supports embedded messages with rich formatting

**Setup:**
1. Create Discord webhook in Server Settings → Integrations → Webhooks
2. Select target text channel (e.g., `1486262758256410646`)
3. Copy webhook URL
4. Set environment variable:
   ```bash
   export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN"
   ```
5. Add to `services/systemd/anqr-ops.env` for persistent service
6. Restart Symphony bridge: `systemctl --user restart anqr-symphony-bridge`

**Files:**
- `scripts/ops/notifications/discord-webhook.mjs` - Core webhook module
- `scripts/ops/notifications/README.md` - Setup documentation
- `scripts/ops/integrations/model/symphony-openai-bridge.mjs` - Integration point

**Environment Variables:**
- `DISCORD_WEBHOOK_URL` - Discord webhook URL (required)
- `DISCORD_WEBHOOK_ENABLED` - Enable/disable webhook (default: true if URL set)

See `scripts/ops/notifications/README.md` for complete setup instructions and testing commands.

**Status**: ✅ Active and streaming to Discord text channel `1486262758256410646`

**Setup Complete (2026-03-25 21:26 GMT+11):**
- Discord webhook URL configured in `services/systemd/anqr-ops.env`
- Symphony bridge updated with corrected TTS endpoint
- OpenClaw Gateway TTS endpoint: `/tools/invoke` (not `/v1/tools/execute`)
- Request format: `{ tool: "tts", args: { text } }` (not `input`)
- All integration tests passing (commit c2623208d):
  ✅ Discord text messages
  ✅ Discord embedded messages
  ✅ Discord progress updates
  ✅ Voice announcements via OpenClaw TTS (audio file generated)
- Test script: `scripts/ops/integrations/notifications/test-discord.mjs`
- Run test: `set -a && source services/systemd/anqr-ops.env && set +a && node scripts/ops/integrations/notifications/test-discord.mjs`

**Voice Playback Status (2026-03-25 21:44 GMT+11):**
- ✅ Discord text notifications: Working (webhook integration active)
- ✅ Discord voice announcements: **WORKING!** Fixed by using correct voice channel ID
- 📝 **Implementation**: Using OpenClaw `message` tool with explicit channel routing
  - Tool: `message` with `action: "send"`
  - Channel: `discord`
  - To: `1486262758256410647` (Discord **voice** channel ID, not text channel)
  - Text channel: `1486262758256410646`
  - OpenClaw routes TTS to voice channel when message is sent to voice channel ID
- ✅ All integration tests passing (commit 906c5d765):
  - ✅ Discord text messages
  - ✅ Discord embedded messages  
  - ✅ Discord progress updates
  - ✅ Voice announcements via OpenClaw message tool
- ✅ Symphony Bridge: Active (PID 1491766, 2026-03-25 21:42 GMT+11)
- ✅ Test script: `scripts/ops/integrations/notifications/test-discord.mjs`
- 📝 **Fix**: Was sending to text channel ID instead of voice channel ID - voice now plays correctly!
