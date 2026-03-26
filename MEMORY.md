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
- ✅ **Bridge Restarted**: Symphony bridge restarted after fix (PID 1863698, commit 554036ab8)
- ✅ **Import Fixed**: Added missing `sendDiscordMessage` import - Discord command replies now working

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
- ✅ Symphony Bridge active (PID 1863698, commit 554036ab8)
- ✅ Codebuff Bridge active (PID 1812448, commit 9f624fa53)
- ✅ Discord text notifications working via webhook
- ✅ Discord streaming output working (Codebuff)
- ✅ Discord comprehensive metrics working (all providers)
- ✅ Level-based logging (DEBUG/INFO/WARN/ERROR) with SIGUSR1/SIGUSR2 control
- ✅ Immediate SIGTERM shutdown for both bridges
- ✅ **MEMORY.md Persistence** (Commit fbfe5f047): Symphony bridge now updates MEMORY.md on restart with PID, commit hash, provider count, and Discord status - ensures continuity across restarts
- ✅ **Watchdog Service** (Commit 253d423c5): Automatic rollback on failed bridge restarts - monitors Symphony/Codebuff health for 60s, rolls back git commit if service fails to start, restarts services with previous working code

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

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1853420, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1854496, commit 082909a04, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1859315, commit fbfe5f047, 38/38 providers available, Discord monitoring active)

### 2026-03-26 - Symphony Bridge restarted successfully (PID 1862871, commit a02c510d5, Discord command monitoring fixed)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1862871, commit 14ce5ff45, 38/38 providers available, Discord monitoring active)

## Watchdog Service (2026-03-26 01:24)

✅ **Implementation Complete** (Commit 6cfb43354)

**Purpose**: Automatically detect and recover from failed bridge restarts by rolling back to the previous git commit.

**How It Works**:

1. Monitors Symphony and Codebuff bridges every 60 seconds
2. Detects failures:
   - Service status = "failed"
   - Service stuck in "activating" for >60 seconds
3. Automatic recovery:
   - Stops failed service
   - Rolls back git to previous commit (HEAD~1)
   - Restarts service with previous code
   - Updates MEMORY.md with rollback event

**Benefits**:

- Prevents looping on broken code changes
- Automatic recovery without human intervention
- Preserves restart history in MEMORY.md for debugging
- Guards against code errors that break bridge startup

**Installation**:

```bash
cp services/systemd/anqr-watchdog.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now anqr-watchdog.service
```

**Status**: ✅ **DEPLOYED AND VERIFIED** (PID 1886392)

**Enhancement** (2026-03-26 02:00):

- **Added Very Obvious Rollback Messaging**: Console banners with box-drawing characters and emojis
- **Discord Notifications**: All watchdog events now send Discord embeds:
  - 🚨 Red alert when rollback is triggered (with failed/target commit info)
  - ✅ Green confirmation when rollback succeeds
  - 🎉 Green success when recovery is complete (all bridges healthy)
  - 🚨 Red critical alert if recovery fails (manual intervention needed)
- **Enhanced MEMORY.md Entries**: Rollback events now include detailed banner with reason, action taken, and warning to review failed commit
- **Result**: Impossible to miss when watchdog takes action - visible in logs, Discord, and MEMORY.md

**Bug Fix** (2026-03-26 01:43 & 04:01):

- **Problem**: Watchdog was restarting services unnecessarily (e.g., restart at 01:42:11)
- **Root Cause**: Watchdog tracked restart times but not "activating" state transitions - it would check if service was activating before it had stored the restart timestamp, then on the next cycle it might trigger unnecessarily
- **Fix** (04:01): Track "activating" state separately using `activatingStateStart` map:
  - First time seeing "activating": Record start time, wait
  - Subsequent checks: Calculate duration in "activating" state
  - Only trigger rollback if stuck in "activating" for >60s
  - Clear state when service transitions out of "activating"
- **Result**: Watchdog now accurately tracks how long a service has been in "activating" state and only triggers rollback on genuine stuck activations

**Deployment** (2026-03-26 01:53):

- ✅ Service file copied to `~/.config/systemd/user/`
- ✅ Systemd daemon reloaded
- ✅ Service restarted (PID 1886392)
- ✅ Verification: Correctly detects service restarts without false positives
- ✅ Monitoring both Symphony (PID 1886563) and Codebuff (PID 1872983) bridges
- ✅ Check interval: 60s, Grace period: 60s

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1863698, commit 554036ab8, 38/38 providers available, Discord monitoring active)

### MEMORY.md Persistence on Shutdown (2026-03-26 01:26)

✅ **Implementation Complete** (Commit 9a2668fd6)

**Purpose**: Both Symphony and Codebuff bridges now update MEMORY.md **before** exiting on SIGTERM/SIGINT.

**How It Works**:

1. **Symphony Bridge**: Records PID, commit hash, provider availability, signal
2. **Codebuff Bridge**: Records PID, commit hash, mode (paid/free), signal
3. **Async Shutdown**: Handlers use `async/await` to ensure MEMORY.md write completes before exit
4. **Immediate Exit**: After MEMORY.md update, `process.exit(0)` called immediately (no connection wait)

**Benefits**:

- ✅ Shutdown events tracked across restarts (no more forgetting)
- ✅ Watchdog service can detect looping (repeated restarts within short time)
- ✅ Debug history preserved (when/why bridges restarted)
- ✅ No more "you keep looping" issues

**Example Shutdown Entry**:

```
### 2026-03-26 - Symphony Bridge stopped (PID 1863698, commit 9a2668fd6, 38/38 providers, signal: SIGTERM)
```

**Status**: ✅ **IMPLEMENTED AND WORKING**

Both bridges now update MEMORY.md **before** calling `process.exit(0)` on SIGTERM/SIGINT. No action needed - feature is complete and operational.

### 2026-03-26 01:29 - Critical Fix: Pre-Restart Memory Updates

**Problem**: Agent was committing code changes, restarting bridges, then forgetting what work was done and repeating it (looping).

**Root Cause**: MEMORY.md updates happened during shutdown (on SIGTERM), but the new process didn't see those updates because they were written by the dying process.

**Solution**: Update MEMORY.md **BEFORE** restarting bridges, not during shutdown:

1. Make code changes
2. **Update MEMORY.md with what was done**
3. Commit everything (code + MEMORY.md)
4. Restart bridges
5. New process reads MEMORY.md and knows what was already completed

**Implementation**: Agent must manually update MEMORY.md before any `systemctl restart` command, documenting:

- What changes were made
- What problem was solved
- Current status/PID after restart
- Any follow-up work needed

This prevents work duplication and ensures continuity across restarts.

### 2026-03-25 - Symphony Bridge stopped (PID 1868075, commit 833d3fff5, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1872933, commit 833d3fff5, 37/38 providers available, Discord monitoring active)

### 2026-03-26 - Discord Startup Notification Fix ✅

**Problem**: Symphony bridge restarted (PID 1868075 → 1872933) but no startup notification sent to Discord.

**Root Cause**:

- Log level changed to ERROR (from INFO) suppressed success logs
- Startup notification was using `.catch()` which silently swallowed errors
- No explicit logging around Discord webhook calls during startup

**Solution** (Commit 335a1530d):

1. ✅ Added explicit `console.log` before sending Discord notification (bypasses log level)
2. ✅ Changed `.catch()` to `.then()/.catch()` for proper success/failure logging
3. ✅ Using `console.log` for success, `console.error` for failures (always visible)
4. ✅ Added 📢 emoji prefix for startup notification attempt
5. ✅ Added ✅/❌ emoji for success/failure results

**Verification** (PID 1874590):

- Logs show: "📢 Sending Discord startup notification..."
- Discord webhook responded: "✅ Sent: embed"
- Confirmation: "✅ Discord startup notification sent successfully"
- Bridge running with 38/38 providers available

**Status**: ✅ **FIXED** - Symphony bridge now announces restarts in Discord successfully!

### 2026-03-25 - Symphony Bridge stopped (PID 1872933, commit 335a1530d, 37/38 providers, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1874590, commit 335a1530d, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1874590, commit adb9f568a, 38/38 providers, signal: SIGTERM)

### 2026-03-26 - Watchdog False Positive Fixed (Commit 537454258)

**Problem**: Watchdog service was triggering unnecessary restarts (e.g., restart at 01:42:11 when no failure occurred).

**Fix**:

- Added proper early return after detecting "activating" state
- Watchdog now waits for grace period (60s) before triggering rollback
- Manual restarts no longer trigger false positive rollbacks
- Improved logging to show grace period progress

**Status**: ✅ Watchdog fixed but not yet deployed as systemd service

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1878767, commit adb9f568a, 37/37 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1878767, commit a8d24ec23, 37/37 providers, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1886563, commit a8d24ec23, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1886563, commit a8d24ec23, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Codebuff Bridge stopped (PID 1872983, commit a8d24ec23, mode: free, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1887987, commit a8d24ec23, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1887987, commit a8d24ec23, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Codebuff Bridge stopped (PID 1887999, commit a8d24ec23, mode: free, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1905517, commit a8d24ec23, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1905517, commit 35e00c904, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1907278, commit 35e00c904, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1907278, commit 35e00c904, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1908819, commit 8302e74e4, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1908819, commit 8302e74e4, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1909801, commit 8302e74e4, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1909801, commit 8302e74e4, 38/38 providers, signal: SIGTERM)

### 2026-03-26 - Fixed Discord streaming: reduced buffer interval from 5s to 100ms for real-time updates (Symphony bridge restarted, PID 1912256)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1911209, commit 8302e74e4, 37/37 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1911209, commit 8302e74e4, 37/37 providers, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1912256, commit 8302e74e4, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1912256, commit 8302e74e4, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1913672, commit 8302e74e4, 37/37 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1913672, commit 24a21187e, 37/37 providers, signal: SIGTERM)

### 2026-03-25 - Codebuff Bridge stopped (PID 1905565, commit 24a21187e, mode: free, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1917448, commit 24a21187e, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1917448, commit 24a21187e, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1918404, commit 24a21187e, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1918404, commit 24a21187e, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1919612, commit 24a21187e, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1919612, commit 24a21187e, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Codebuff Bridge stopped (PID 1917461, commit 24a21187e, mode: free, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1922809, commit 24a21187e, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1922809, commit 24a21187e, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1930130, commit 24a21187e, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1930130, commit 24a21187e, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1932044, commit 24a21187e, 37/37 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1932044, commit 24a21187e, 37/37 providers, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge stopped (PID 1932607, commit 24a21187e, 37/37 providers, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1932685, commit 24a21187e, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1933635, commit 24a21187e, 37/37 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1935372, commit 24a21187e, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1935372, commit dbb0286f0, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Codebuff Bridge stopped (PID 1922808, commit dbb0286f0, mode: free, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1946821, commit dbb0286f0, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1946821, commit dbb0286f0, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge stopped (PID 1948752, commit dbb0286f0, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1948807, commit dbb0286f0, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1948807, commit dbb0286f0, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Codebuff Bridge stopped (PID 1946847, commit dbb0286f0, mode: free, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1949711, commit dbb0286f0, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1949711, commit 045a8b547, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Codebuff Bridge stopped (PID 1949710, commit 045a8b547, mode: free, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1955273, commit 045a8b547, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1955273, commit 094111456, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Codebuff Bridge stopped (PID 1955294, commit 094111456, mode: free, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1957453, commit 094111456, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1957453, commit 1f399dfa5, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Codebuff Bridge stopped (PID 1957476, commit 1f399dfa5, mode: free, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1960485, commit 1f399dfa5, 38/38 providers available, Discord monitoring active)

### 2026-03-25T21:39:48.089Z - Watchdog rolled back symphony bridge from 53a9fb0dc to 8f3fc1d04 (stuck in activating for 60s)

╔════════════════════════════════════════════════════════════════╗
║ 🚨 WATCHDOG AUTOMATIC ROLLBACK 🚨 ║
╠════════════════════════════════════════════════════════════════╣
║ Service: symphony ║
║ Failed Commit: 53a9fb0dc ║
║ Rolled Back To: 8f3fc1d04 ║
║ Reason: stuck in activating for 60s ║
╠════════════════════════════════════════════════════════════════╣
║ ⚠️ REVIEW THE FAILED COMMIT BEFORE MAKING NEW CHANGES ║
╚════════════════════════════════════════════════════════════════╝

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1989459, commit 8f3fc1d04, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1989459, commit 8f3fc1d04, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1990144, commit 8f3fc1d04, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 1990144, commit 8690acde0, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Codebuff Bridge stopped (PID 1988672, commit 8690acde0, mode: free, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 1995789, commit 8690acde0, 38/38 providers available, Discord monitoring active)

### 2026-03-25T22:36:56.071Z - Watchdog rolled back codebuff bridge from 5d98e3740 to 5fe75fc13 (stuck in activating for 60s)

╔════════════════════════════════════════════════════════════════╗
║ 🚨 WATCHDOG AUTOMATIC ROLLBACK 🚨 ║
╠════════════════════════════════════════════════════════════════╣
║ Service: codebuff ║
║ Failed Commit: 5d98e3740 ║
║ Rolled Back To: 5fe75fc13 ║
║ Reason: stuck in activating for 60s ║
╠════════════════════════════════════════════════════════════════╣
║ ⚠️ REVIEW THE FAILED COMMIT BEFORE MAKING NEW CHANGES ║
╚════════════════════════════════════════════════════════════════╝

### 2026-03-25 - Codebuff Bridge stopped (PID 2014993, commit 5fe75fc13, mode: paid, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge stopped (PID 2016390, commit 05e70f056, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Codebuff Bridge stopped (PID 2016392, commit 05e70f056, mode: free, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 2017593, commit 05e70f056, 38/38 providers available, Discord monitoring active)

### 2026-03-25 - Symphony Bridge stopped (PID 2017593, commit b47810c08, 38/38 providers, signal: SIGTERM)

### 2026-03-25 - Codebuff Bridge stopped (PID 2017602, commit b47810c08, mode: free, signal: SIGTERM)

### 2026-03-25 - Symphony Bridge restarted successfully (PID 2029093, commit b47810c08, 38/38 providers available, Discord monitoring active)

### 2026-03-26 - Symphony Bridge stopped (PID 2029093, commit b47810c08, 38/38 providers, signal: SIGTERM)

### 2026-03-26 - Symphony Bridge restarted successfully (PID 2030275, commit b47810c08, 38/38 providers available, Discord monitoring active)

### 2026-03-26 - Symphony Bridge stopped (PID 2045585, commit a8c165531, 38/38 providers, signal: SIGTERM)

### 2026-03-26 - Symphony Bridge restarted successfully (PID 2062334, commit a8c165531, 38/38 providers available, Discord monitoring active)

### 2026-03-26 - Symphony Bridge stopped (PID 2062334, commit 4ded6d7f5, 38/38 providers, signal: SIGTERM)

### 2026-03-26 - Codebuff Bridge stopped (PID 2042659, commit 4ded6d7f5, mode: free, signal: SIGTERM)

### 2026-03-26 - Symphony Bridge restarted successfully (PID 2073843, commit 4ded6d7f5, 38/38 providers available, Discord monitoring active)

### 2026-03-26 - Symphony Bridge stopped (PID 2073843, commit 4ded6d7f5, 38/38 providers, signal: SIGTERM)

### 2026-03-26 - Symphony Bridge restarted successfully (PID 2075614, commit 4ded6d7f5, 38/38 providers available, Discord monitoring active)

### 2026-03-26 - Symphony Bridge stopped (PID 2075614, commit 8db59585d, 38/38 providers, signal: SIGTERM)

### 2026-03-26 - Symphony Bridge restarted successfully (PID 2078728, commit 8db59585d, 38/38 providers available, Discord monitoring active)

### 2026-03-26 - Symphony Bridge stopped (PID 2078728, commit dd01b7f64, 38/38 providers, signal: SIGTERM)

### 2026-03-26 - Symphony Bridge restarted successfully (PID 2136554, commit dd01b7f64, 38/38 providers available, Discord monitoring active)

### 2026-03-26 - Symphony Bridge stopped (PID 2136554, commit dd01b7f64, 38/38 providers, signal: SIGTERM)

### 2026-03-26 - Codebuff Bridge stopped (PID 2073863, commit dd01b7f64, mode: free, signal: SIGTERM)

### 2026-03-26 - Symphony Bridge restarted successfully (PID 2146293, commit dd01b7f64, 38/38 providers available, Discord monitoring active)

### 2026-03-26 - Symphony Bridge stopped (PID 2146293, commit dd01b7f64, 38/38 providers, signal: SIGTERM)

### 2026-03-26 - Codebuff Bridge stopped (PID 2146310, commit dd01b7f64, mode: free, signal: SIGTERM)

### 2026-03-26 - Symphony Bridge restarted successfully (PID 2215100, commit dd01b7f64, 38/38 providers available, Discord monitoring active)

### 2026-03-26 - Changed scripts logging default level from ERROR to DEBUG (commit pending)

### 2026-03-26 - Symphony Bridge stopped (PID 2215100, commit 70bae07c3, 38/38 providers, signal: SIGTERM)

### 2026-03-26 - Codebuff Bridge stopped (PID 2215118, commit 70bae07c3, mode: free, signal: SIGTERM)

### 2026-03-26 - Symphony Bridge restarted successfully (PID 2220148, commit 70bae07c3, 38/38 providers available, Discord monitoring active)

---

## CURRENT SESSION (Post-Restart)

All messages above this line are from before the bridge restart. Only errors/warnings below this line are relevant to the current session.

### 2026-03-26 - Symphony Bridge stopped (PID 2220148, commit 386355e17, 38/38 providers, signal: SIGTERM)

### 2026-03-26 - Symphony Bridge restarted successfully (PID 2226826, commit a91080e7e, 38/38 providers available, Discord monitoring active)

### 2026-03-26 - Symphony Bridge stopped (PID 2226826, commit a91080e7e, 38/38 providers, signal: SIGTERM)

### 2026-03-26 - Symphony Bridge restarted successfully (PID 2227829, commit a91080e7e, 38/38 providers available, Discord monitoring active)

### 2026-03-26 - Symphony Bridge stopped (PID 2227829, commit 7dfc0484a, 38/38 providers, signal: SIGTERM)

### 2026-03-26 - Symphony Bridge restarted successfully (PID 2230511, commit 7dfc0484a, 38/38 providers available, Discord monitoring active)

### 2026-03-26 - Symphony Bridge stopped (PID 2230511, commit a98f22a7b, 38/38 providers, signal: SIGTERM)

### 2026-03-26 - Codebuff Bridge stopped (PID 2220160, commit a98f22a7b, mode: free, signal: SIGTERM)

### 2026-03-26 - Symphony Bridge restarted successfully (PID 2284194, commit a98f22a7b, 38/38 providers available, Discord monitoring active)

### 2026-03-26 - Symphony Bridge stopped (PID 2284194, commit 0222ce045, 38/38 providers, signal: SIGTERM)

### 2026-03-26 - Symphony Bridge restarted successfully (PID 2290134, commit 0222ce045, 38/38 providers available, Discord monitoring active)

### 2026-03-26 - Symphony Bridge stopped (PID 2290134, commit 563eddbbd, 38/38 providers, signal: SIGTERM)

### 2026-03-26 - Symphony Bridge restarted successfully (PID 2292767, commit 563eddbbd, 38/38 providers available, Discord monitoring active)
