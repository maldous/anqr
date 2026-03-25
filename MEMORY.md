# OpenClaw Memory

## User Preferences

### Discord Integration (2026-03-26 00:33)

**Voice Channel (1486262758256410647)**:
- User sends voice commands → OpenClaw responds with voice
- User sends text commands → OpenClaw responds with voice
- OpenClaw automatically handles TTS when responding in Discord sessions

**Text Channel (1486262758256410646)**:
- ✅ **Command Monitoring Active**: Symphony bridge polls channel every 5s for user messages
- ✅ **Command Processing**: User commands sent to Symphony → responses via webhook
- ✅ **Request Notifications**: Start/stop summaries via webhook (1486304408286527539)
- ✅ **Streaming Output**: Real-time responses streamed to Discord during execution
- ✅ **Fixed**: Discord command reply error - changed `sendDiscordNotification({ content })` to `sendDiscordMessage(content)`
- ✅ **Bridge Restarted**: Symphony bridge restarted after fix (PID: 1849000, commit 009677499)

**Notification Format**:
- **Initial**: Request description, provider, model
- **Completion**: Characters/tokens, total time
- **Linear issues**: Embedded messages using Linear.app fields (status, provider, tokens/time)

**Implementation** (Commit 4770570e5):
✅ Voice announcements removed from Symphony bridge (OpenClaw handles TTS in Discord sessions)
✅ Text notifications via webhook to text channel
✅ Embedded messages for all notifications (structured, readable)
✅ Real-time streaming output to Discord (Codebuff) - buffered in ~100 char chunks for readability
✅ Comprehensive metrics at completion (all heuristics)
✅ Color-coded: Orange (processing), Green (complete)
✅ No periodic progress updates (too noisy)
✅ Fixed: Proper text handling (no more "[object Object]")
✅ Fixed: Removed duplicate emoji prefixes

### Discord Webhook Integration (2026-03-26 00:19)
- ✅ Created `scripts/ops/integrations/notifications/discord-webhook.mjs` module
- ✅ Integrated with Symphony bridge for request notifications
- ✅ Webhook URL configured in `services/systemd/anqr-ops.env`
- ✅ Discord text channel: 1486262758256410646
- ✅ Discord voice channel: 1486262758256410647 (for OpenClaw automatic TTS)
- 📝 Webhook URL: https://discord.com/api/webhooks/1486304408286527539/...

**Notification Flow** (Commit 993bd01e1):
1. **Initial**: Embedded message with request description, provider, model (Orange)
2. **Streaming**: Real-time output forwarded to Discord as received (Codebuff only)
3. **Completion**: Embedded message with comprehensive metrics (Green):
   - Output size (characters or tokens)
   - Execution time
   - Provider name
   - Tokens In/Out (if available)
   - Avg Duration (from credit-gate heuristics)
   - Success Rate (from credit-gate heuristics)
   - Validation Rate (from credit-gate heuristics)
   - Linear Completion Rate (from credit-gate heuristics)
   - Score (from credit-gate heuristics)

**Functions available:**
- `sendDiscordNotification(payload)` - Full structured webhook payload
- `sendDiscordMessage(message)` - Simple text message
- `sendDiscordEmbed({ title, description, ... })` - Rich embed (not used - too verbose)
- `streamDiscordUpdate(message, { emoji, timestamp })` - Stream progress updates

### Symphony Bridge Adaptive Provider Selection (2026-03-26)
- ✅ Implemented session-aware provider stickiness
- ✅ Paid providers (codex, codebuff-paid) are sticky until exhausted
- ✅ Free providers rotate after adaptive turn limits (base: 10, range: 3-25)
- ✅ Self-tuning system adjusts parameters based on observed performance
- ✅ Periodic evaluation cycles every 1 hour (changed from 6 hours per user request)
- ✅ Codebuff mode detection via X-Codebuff-Mode header
- ✅ Provider rankings cleared and starting fresh (2026-03-25 20:04 UTC+11)
- ✅ Symphony Bridge active (PID 1849000, commit 009677499)
- ✅ Codebuff Bridge active (PID 1812448, commit 9f624fa53)
- ✅ Discord text notifications working via webhook
- ✅ Discord streaming output working (Codebuff)
- ✅ Discord comprehensive metrics working (all providers)
- ✅ Level-based logging (DEBUG/INFO/WARN/ERROR) with SIGUSR1/SIGUSR2 control
- ✅ Immediate SIGTERM shutdown for both bridges

### Voice Setup (2026-03-25)
- ✅ Discord voice integration working
- ✅ Bot auto-joins voice channel (Guild: 1486262757543121021, Channel: 1486262758256410647)
- ✅ TTS configured with Microsoft (primary) + ElevenLabs (fallback)
- ✅ Two-way voice conversations operational
- ✅ OpenClaw speaks responses automatically in Discord sessions
- ⚠️ Web Chat Control UI has limited TTS playback (browser restrictions)

## Recent Configuration

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

## Technical Notes

### Level-Based Logging (2026-03-26 00:52)

Both Symphony and Codebuff bridges now support dynamic log level control:

**Log Levels**:
- `DEBUG` (0): Everything including JSON payloads, SSE chunks, provider probes
- `INFO` (1): Normal operations, requests, completions, metrics
- `WARN` (2): Warnings, rate limits, fallbacks
- `ERROR` (3): Errors only

**Dynamic Control**:
- `SIGUSR1`: Increase log level (less verbose) - `kill -USR1 <PID>`
- `SIGUSR2`: Decrease log level (more verbose) - `kill -USR2 <PID>`
- Current level logged on change: `[bridge] Log level changed: INFO → DEBUG`

**Default Level**: `INFO` (configurable via `LOG_LEVEL` env var)

**Benefits**:
- Reduce noise in production (set to WARN/ERROR)
- Enable debugging without restart (send SIGUSR2 for DEBUG)
- Rate limit errors no longer spam logs (only shown at DEBUG level)

**Implementation** (Commit 9f624fa53):
- Global `logLevel` variable with level checks before logging
- SIGUSR1/SIGUSR2 handlers increment/decrement level
- All log statements wrapped in level checks (e.g., `if (logLevel <= LOG_LEVELS.DEBUG)`)
- Immediate SIGTERM shutdown (process.exit(0) without waiting for connections)

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
