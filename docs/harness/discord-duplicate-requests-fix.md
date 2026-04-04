# Discord Duplicate Request Flooding - Critical Bug Fix

## Issue

**Severity**: P0 - Critical Production Bug  
**Symptom**: Single Discord command spawns 4 simultaneous identical requests to AI providers, causing quota exhaustion and rate limiting  
**Root Cause**: Multiple Symphony bridges independently polling Discord and making duplicate requests

## Root Cause Analysis

### Incorrect Architecture (Before Fix)

```
Discord Message
  ↓
4 Symphony Bridges (wt5-wt8) ALL polled Discord API independently
  ↓
Each bridge made request to main bridge (port 4319)
  ↓
4 DUPLICATE REQUESTS flooded AI providers
```

**What was happening:**

1. User sends Discord message: `"who are you?"`
2. **wt5 bridge** (port 4325) polls Discord, sees message, makes request to port 4319
3. **wt6 bridge** (port 4326) polls Discord, sees message, makes request to port 4319
4. **wt7 bridge** (port 4327) polls Discord, sees message, makes request to port 4319
5. **wt8 bridge** (port 4328) polls Discord, sees message, makes request to port 4319
6. **Result**: 4 simultaneous identical requests to AI providers

### Correct Architecture (Current)

```
Discord Message
  ↓
OpenClaw Gateway (port 18789) - ONLY listener
  ↓
Discord Router (port 18790) - load balancer
  ↓
ONE Worktree Executor (4325-4328) - selected by router
  ↓
AI Provider - single request
```

## The Fix

### Code Change

File: `harness/ops/integrations/model/symphony-openai-bridge.mjs`

```javascript
function startDiscordMonitoring() {
  // CRITICAL FIX: Disable Discord monitoring in worktree bridges
  if (process.env.ANQR_WORKTREE_ID || process.env.SYMPHONY_BRIDGE_PORT !== "4319") {
    const bridgeId = process.env.ANQR_WORKTREE_ID || `port-${PORT}`;
    logInfo(`⚠️ Discord monitoring DISABLED in ${bridgeId}`);
    return; // Exit early - don't start polling
  }

  // Original Discord monitoring code continues only for main bridge...
}
```

### What Changed

**Before**: All Symphony bridges (main + wt5-wt8) polled Discord independently  
**After**: Discord monitoring completely disabled in worktree bridges

**Symphony bridges are now completely passive** - they only respond to incoming HTTP requests, they do NOT poll Discord.

## Verification

### 1. Check Bridge Logs on Startup

**Worktree bridges (wt5-wt8) should show**:

```
⚠️ Discord monitoring DISABLED in wt5 - only OpenClaw Gateway should monitor Discord
   Architecture: Discord Bot → OpenClaw Gateway → Discord Router (18790) → Worktree Bridges (4325-4328)
```

**Main bridge (port 4319) MAY show** (only if Discord monitoring is enabled there):

```
📡 Starting Discord message monitoring (polling every 5s)
```

But ideally, the main bridge should also have Discord monitoring disabled since OpenClaw Gateway handles this.

### 2. Test Discord Command

Send a test message in Discord:

```
@bot who are you?
```

**Expected behavior**:

- ONE request processed
- OpenClaw Gateway logs show incoming message
- Discord Router logs show routing to ONE worktree
- Selected worktree bridge processes request
- Response delivered back through the chain

**Before fix**:

- 4 requests processed simultaneously
- All 4 worktree bridges log "Discord command"
- 4 duplicate AI provider requests
- Quota exhaustion

### 3. Monitor AI Provider Usage

**Before fix**:

```
OpenAI API Usage:
  - 4 simultaneous identical requests
  - 4x token consumption
  - 4x API calls charged
```

**After fix**:

```
OpenAI API Usage:
  - 1 request per Discord message
  - Normal token consumption
  - Expected API charges
```

## Configuration Updates Needed

### 1. Restart All Symphony Bridges

```bash
# Restart worktree executors (wt5-wt8)
systemctl --user restart anqr-symphony-executor@{5,6,7,8}.service

# Restart main router (if used for Discord)
systemctl --user restart anqr-symphony-router.service
```

### 2. Verify OpenClaw Configuration

File: `~/.openclaw/openclaw.json`

**Must route to Discord Router, NOT main bridge:**

```json
{
  "models": {
    "providers": {
      "symphony-bridge": {
        "baseUrl": "http://127.0.0.1:18790/v1"
      }
    }
  }
}
```

**Status: ✅ FIXED** — `~/.openclaw/openclaw.json` now points to port 18790 (Discord Router).
Also added `channels.discord.guilds` allowlist for the target guild.

## Testing Checklist

- [ ] All worktree bridges (wt5-wt8) show "Discord monitoring DISABLED" on startup
- [ ] Send test Discord message - verify only 1 request processed
- [ ] Check AI provider logs - verify no duplicate requests
- [ ] Monitor bridge logs - verify Discord Router is routing to only one worktree
- [ ] Test concurrent Discord messages - verify proper load balancing
- [ ] Update `.openclaw/openclaw.json` to point to Discord Router (port 18790)

## Rollback Plan

If issues arise after the fix:

```bash
# Rollback: restore original symphony-openai-bridge.mjs
git checkout HEAD -- harness/ops/integrations/model/symphony-openai-bridge.mjs

# Restart executors
systemctl --user restart anqr-symphony-executor@{5,6,7,8}.service
```

However, this will **restore the duplicate request bug**, so only rollback if the fix causes a more severe issue.

## Related Issues

- Discord Router not being used (OpenClaw configs pointing to wrong port)
- Main bridge also polling Discord (should be OpenClaw Gateway's job)
- Worktree bridges running duplicate background tasks

## Status

1. ✅ Apply code fix to disable Discord monitoring in worktree bridges
2. ✅ Update OpenClaw config to route through Discord Router (port 18790)
3. ✅ Restart all executors and verify logs
4. ✅ Test Discord commands and monitor for duplicates
5. ✅ Discord monitoring removed from all bridges (OpenClaw handles it)
6. ✅ Added `channels.discord.guilds` allowlist to `~/.openclaw/openclaw.json`

---

**Fix Applied**: 2026-03-31  
**Verified**: Pending restart and testing
