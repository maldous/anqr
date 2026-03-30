# ANQ-1137: Discord Voice Channel Bot Visibility Investigation

**Date**: 2026-03-30  
**Scope**: docs-harness  
**Status**: Root cause identified, remediation steps documented

---

## Executive Summary

Discord bot not visible in voice channel due to outdated systemd service configuration. User's installed `anqr-discord-bridge@.service` file has placeholder `ExecStart=/bin/sleep infinity` instead of the correct gateway singleton wrapper script.

---

## Root Cause Analysis

### Primary Issue

**Stale service configuration**: User's `~/.config/systemd/user/anqr-discord-bridge@.service` contains:

```ini
ExecStart=/bin/sleep infinity
```

**Expected configuration** from repository `services/systemd/anqr-discord-bridge@.service`:

```ini
ExecStart=%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr-wt%i/scripts/ops/runtime/discord/openclaw-gateway-singleton.mjs
```

### Contributing Factors

1. **Wrong service instances running**: @{1,2,3,4} active instead of @{5,6,7,8}
   - Discord worktrees are wt5-wt8 per architecture docs
   - Services @1-@4 point to non-existent worktrees for Discord context

2. **Timers not enabled**: @{5,6,7,8}.timer exist but are INACTIVE (dead)
   ```
   anqr-discord-bridge@5.timer loaded inactive dead
   anqr-discord-bridge@6.timer loaded inactive dead
   anqr-discord-bridge@7.timer loaded inactive dead
   anqr-discord-bridge@8.timer loaded inactive dead
   ```

3. **Missing DISCORD_BOT_TOKEN**: Environment variable declared but has no value
   - Causes systemd warning: `Invalid environment assignment, ignoring: DISCORD_BOT_TOKEN`
   - Token should be in `~/.config/systemd/user/anqr-ops.env` or `~/.config/symphony/anqr.env`

4. **No gateway process running**:
   - No `openclaw gateway` process found in `ps aux`
   - No lock file at `~/.cache/anqr-openclaw/gateway.lock`
   - Gateway never started because service runs `sleep` instead

---

## Diagnostic Evidence

### Service Status
```bash
$ systemctl --user status 'anqr-discord-bridge@*.service'
● anqr-discord-bridge@1.service - ANQR Discord/OpenClaw bridge (worktree 1)
   Active: active (running) since Mon 2026-03-30 17:44:23
   Main PID: 335964 (sleep)
   CGroup: └─335964 /bin/sleep infinity
```

**Analysis**: Service running `/bin/sleep infinity` — no actual gateway process.

### Process Check
```bash
$ ps aux | grep openclaw | grep -v grep
(no results)
```

**Analysis**: No OpenClaw Gateway process running anywhere.

### Lock File Status
```bash
$ cat ~/.cache/anqr-openclaw/gateway.lock
Lock file not found
```

**Analysis**: No worktree has acquired gateway lock (expected, since gateway never started).

### Worktree Verification
```bash
$ ls -d ~/src/anqr-wt{5,6,7,8}
/home/user/src/anqr-wt5
/home/user/src/anqr-wt6
/home/user/src/anqr-wt7
/home/user/src/anqr-wt8
```

**Analysis**: Correct Discord worktrees exist and are ready for gateway singleton.

---

## Impact Assessment

**Severity**: P3 (Low) — Harness operational stability unaffected

**User Impact**:
- Discord bot completely absent from voice channel (not visible)
- No voice interaction capability
- Text-based Discord interaction via webhook still functional

**Scope**:
- Discord voice features only
- Does not affect Symphony runner, queue management, or core harness operations

---

## Remediation Steps

### Step 1: Disable Wrong Service Instances

```bash
systemctl --user disable --now anqr-discord-bridge@{1,2,3,4}.service
systemctl --user disable --now anqr-discord-bridge@{1,2,3,4}.timer
```

### Step 2: Update Service Configuration

```bash
# Copy latest service file from repository
cp ~/src/anqr/services/systemd/anqr-discord-bridge@.service ~/.config/systemd/user/
cp ~/src/anqr/services/systemd/anqr-discord-bridge@.timer ~/.config/systemd/user/

# Reload systemd to pick up changes
systemctl --user daemon-reload
```

### Step 3: Configure Discord Bot Token

Edit `~/.config/systemd/user/anqr-ops.env` or `~/.config/symphony/anqr.env` and add:

```bash
DISCORD_BOT_TOKEN=your_discord_bot_token_here
```

**Token source**: Discord Developer Portal → Applications → Your Bot → Bot Token

### Step 4: Enable Correct Service Instances

```bash
systemctl --user enable --now anqr-discord-bridge@{5,6,7,8}.timer
```

### Step 5: Verify Gateway Started

```bash
# Check service status
systemctl --user status 'anqr-discord-bridge@*.service'

# Verify gateway process running
ps aux | grep 'openclaw gateway' | grep -v grep

# Check which worktree owns the lock
cat ~/.cache/anqr-openclaw/gateway.lock

# Test gateway health
curl http://127.0.0.1:18789/health
```

### Step 6: Monitor Gateway Logs

```bash
journalctl --user -u 'anqr-discord-bridge@*.service' -f
```

**Expected output**: One worktree (e.g., wt5) acquires lock and starts gateway, others wait as followers.

---

## Verification Criteria

- [ ] One `openclaw gateway` process running (owner worktree)
- [ ] Lock file exists with valid PID: `~/.cache/anqr-openclaw/gateway.lock`
- [ ] Gateway responds to health check: `curl http://127.0.0.1:18789/health`
- [ ] Discord bot visible in server member list
- [ ] Discord bot joins voice channel on request
- [ ] Bot responds to voice commands (if configured)
- [ ] No systemd warnings about DISCORD_BOT_TOKEN
- [ ] Services @5-@8 active, @1-@4 disabled

---

## Architecture Notes

### Gateway Singleton Design

**Purpose**: Prevent multiple OpenClaw Gateway instances from competing for Discord bot connection.

**Mechanism**:
1. Four service instances (@5, @6, @7, @8) start simultaneously
2. Each runs `openclaw-gateway-singleton.mjs` wrapper
3. First worktree to acquire `~/.cache/anqr-openclaw/gateway.lock` becomes owner
4. Owner worktree spawns actual `openclaw gateway` process
5. Follower worktrees sleep and monitor lock, ready to take over if owner dies

**Benefits**:
- Eliminates Bonjour hostname conflicts (e.g., "foo (OpenClaw) (4)")
- Prevents Discord command rate limit 429 errors from restart storms
- Provides automatic failover if gateway crashes

**Reference**: `docs/harness/discord-voice-integration.md` section 0 (Gateway stabilization)

---

## OpenClaw Configuration

The `.openclaw/openclaw.json` file in main repository is correctly configured:

```json
{
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "loopback",
    "auth": {
      "mode": "token",
      "token": "6632920657f34f9315104491432b536d65f6513626c60b78"
    }
  }
}
```

**Note**: Each worktree (wt5-wt8) should have identical `.openclaw/openclaw.json` configuration pointing to port 18789.

---

## Discord Bot Requirements

### Required Permissions (Discord Server Settings)

- **Connect**: Join voice channels
- **Speak**: Transmit audio in voice channels
- **Use Voice Activity**: Detect voice input without push-to-talk

### Required Intents (Discord Developer Portal)

- **GUILD_VOICE_STATES**: Track voice channel connections and states

### Voice Dependencies (OpenClaw)

OpenClaw Gateway must have these npm packages installed:

- `@discordjs/voice` — Discord.js voice support
- `libsodium-wrappers` — Audio encryption
- `ffmpeg` — System-level audio processing (install via package manager)

### Environment Variables

```bash
DISCORD_BOT_TOKEN=your_token_here
DISCORD_SERVER_ID=1486262757543121021
DISCORD_TEXT_CHANNEL_ID=1486262758256410646
DISCORD_VOICE_CHANNEL_ID=1486262758256410647
```

---

## Follow-Up Work

### Immediate

- [ ] User must manually apply remediation steps (human-only action)
- [ ] Verify bot appears in Discord voice channel after remediation
- [ ] Test voice announcement via OpenClaw message tool
- [ ] Monitor gateway stability over 24-48 hours

### Future Enhancements

- [ ] Add health check to verify gateway singleton is running (ANQ-1138?)
- [ ] Add monitoring alert if no Discord bridge service owns gateway lock for >5min
- [ ] Consider adding DISCORD_BOT_TOKEN validation to harness-doctor.mjs
- [ ] Document voice testing procedure in `docs/harness/discord-voice-integration.md`

---

## Related Issues

- **ANQ-1097**: Discord bot Bonjour hostname conflicts → resolved by gateway singleton
- **ANQ-1098**: Discord thinking emoji issue → separate concern

---

## Decision Log

**Decision**: Document remediation steps instead of automated fix  
**Rationale**: Issue requires human operator intervention:
1. Must obtain/configure DISCORD_BOT_TOKEN (secret material, human-only)
2. Must verify Discord bot permissions in Discord Developer Portal (external system)
3. Must disable wrong service instances without breaking active harness operations
4. Service file update should be deliberate operator action, not automated

**Risk**: Low — isolated to Discord voice features, does not affect core harness

---

## Lessons Learned

1. **Systemd service files need update mechanism**: When harness changes service behavior, users must be notified to re-copy service files
2. **Service template documentation should emphasize correct instance numbers**: Docs say @5-@8, but user had @1-@4 enabled
3. **Environment variable validation**: Consider startup checks for required but empty environment variables
4. **Gateway singleton health monitoring**: Current design lacks external visibility into which worktree owns gateway

---

## References

- `docs/harness/discord-voice-integration.md` — Voice architecture and troubleshooting
- `services/systemd/anqr-discord-bridge@.service` — Canonical service definition
- `scripts/ops/runtime/discord/openclaw-gateway-singleton.mjs` — Gateway wrapper implementation
- `docs/harness/02-runtime-and-services.md` — Service inventory and ownership

---

**Investigator**: Symphony Agent (ANQ-1137)  
**Evidence Captured**: 2026-03-30  
**Status**: Investigation complete, requires human operator action
