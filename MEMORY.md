# OpenClaw Memory

## User Preferences

### Discord Announcements
- **CRITICAL REQUIREMENT**: ALWAYS open response in chat GUI first, then stream progress updates to Discord
- **Why**: User is listening via Discord voice TTS when away from computer
- **Implementation**: 
  1. Send initial "Working on it..." message immediately
  2. Stream progress updates during Symphony bridge processing
  3. Send completion message with summary
- **Context**: User can listen when away from computer and might respond
- **Use case**: Voice-based monitoring of long-running AI tasks
- **Date added**: 2026-03-25
- ⚠️ **Note**: `message` tool not available in web chat context (can only send from Discord channel)

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
- ✅ Symphony Bridge restarted with clean slate (PID 1379367)
- ⚠️ Discord announcements: `message` tool not available in web chat context (can only send from Discord channel)
- ⚠️ Codebuff bridge tool errors: `message`, `memory_get`, `read` not available in bridge context (these are OpenClaw-specific tools)
- 📝 Implementing OpenClaw tool proxying in Codebuff bridge requires architecture changes (see below)

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

**Architecture**: Codebuff → OpenClaw Gateway `/tools/invoke` (stateless proxy)

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
