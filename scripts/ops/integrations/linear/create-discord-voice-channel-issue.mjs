#!/usr/bin/env node

/**
 * create-discord-voice-channel-issue.mjs — Create Linear issue for Discord bot voice channel problem
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Discord voice channel: bot visibility and audio response issues",
  description: `## Summary

Discord bot is no longer visible in voice channel, and when it was visible, there was no audio response despite being able to talk to it.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- Harness: OpenClaw Gateway singleton wrapper (\`openclaw-gateway-singleton.mjs\`)
- Harness: Discord bot voice integration via OpenClaw Gateway
- External: OpenClaw Gateway Discord bot configuration

## Constraints

- **Architecture**: Voice functionality is managed by OpenClaw Gateway (external to ANQR)
- **Launch-claim**: Harness only (not product runtime)
- **Human-only**: May require OpenClaw Gateway configuration or Discord bot permissions
- **Scope boundary**: ANQR can invoke voice features but cannot configure OpenClaw's Discord bot

## Problem Statement

User reports two distinct issues:

1. **Bot no longer visible in voice channel** (regression)
   - Previously the bot was visible in the voice channel
   - Now the bot does not appear at all
   - Unclear if this is transient or persistent

2. **No audio response when bot was visible** (previous state)
   - User could talk to the bot
   - Bot did not respond with audio
   - No indication the bot could hear the user

## Investigation Path

### 1. Gateway Singleton State

- [ ] Check if \`anqr-discord-bridge@{5,6,7,8}.service\` are running
- [ ] Verify \`openclaw-gateway-singleton.mjs\` lock acquisition status
- [ ] Check which worktree owns the gateway lock (\`~/.cache/anqr-openclaw/gateway.lock\`)
- [ ] Review gateway process logs: \`journalctl --user -u 'anqr-discord-bridge@*.service' --since '1 hour ago'\`

### 2. OpenClaw Gateway Health

- [ ] Verify gateway is reachable: \`curl http://127.0.0.1:18789/health\`
- [ ] Check if Discord bot is configured in OpenClaw
- [ ] Verify \`.openclaw/openclaw.json\` has Discord bot token set
- [ ] Check if gateway process is actually running: \`ps aux | grep 'openclaw gateway'\`

### 3. Discord Bot Configuration

- [ ] Verify bot is online in Discord server
- [ ] Check bot permissions: Connect, Speak, Use Voice Activity
- [ ] Verify bot intents include GUILD_VOICE_STATES
- [ ] Check voice channel ID matches environment variable (\`DISCORD_VOICE_CHANNEL_ID=1486262758256410647\`)

### 4. Voice Dependencies

- [ ] Verify OpenClaw has voice dependencies installed:
   - \`@discordjs/voice\`
   - \`libsodium-wrappers\`
   - \`ffmpeg\` (system dependency)
- [ ] Check OpenClaw version supports voice features

### 5. Transient vs Persistent

- [ ] Is this a race condition during gateway restart?
- [ ] Does restarting \`anqr-discord-bridge@*.service\` fix visibility?
- [ ] Are there any error logs indicating voice connection failures?
- [ ] Check if Discord API rate limits are affecting reconnection

## Impact

- **Severity**: P3 (Low) - Does not affect core harness functionality
- **Scope**: Discord voice interaction only
- **User impact**: Cannot interact with bot via voice
- **Workaround**: Text-based Discord interactions still work via OpenClaw message tool

## Diagnostic Commands

\`\`\`bash
# Check service status
systemctl --user status 'anqr-discord-bridge@*.service'

# Check gateway lock
cat ~/.cache/anqr-openclaw/gateway.lock

# Check recent logs
journalctl --user -u 'anqr-discord-bridge@*.service' --since '1 hour ago' | tail -100

# Test gateway health
curl http://127.0.0.1:18789/health

# Check for running gateway process
ps aux | grep 'openclaw gateway'

# Test OpenClaw message tool (requires OPENCLAW_GATEWAY_TOKEN)
curl -X POST http://127.0.0.1:18789/tools/invoke \\
  -H "Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "tool": "message",
    "args": {
      "action": "send",
      "message": "Test voice announcement",
      "channel": "discord",
      "to": "1486262758256410647"
    }
  }'
\`\`\`

## Definition Of Done

- [ ] Root cause identified (transient vs configuration vs code issue)
- [ ] Bot consistently visible in Discord voice channel
- [ ] Bot can hear user voice input (verified via logs or response)
- [ ] Bot responds with audio output when expected
- [ ] Stability verified over multiple gateway restarts
- [ ] Documentation updated if configuration changes required

## Evidence Payload

- Summary: Discord voice channel investigation and remediation
- Scope class: docs-harness
- Touched paths: OpenClaw Gateway configuration, systemd service logs
- Decisions made: Voice connection approach (OpenClaw-owned vs ANQR-owned)
- Commands run: Gateway health checks, service status, voice connection tests
- Pass/fail result: Bot visible and responsive in voice channel
- Risk: Low - isolated to Discord voice features
- Follow-up work: Monitor voice stability, consider voice connection health checks

## Related Documentation

- \`docs/harness/discord-voice-integration.md\` — Voice architecture and troubleshooting
- \`services/systemd/anqr-discord-bridge@.service\` — Gateway singleton service definition
- \`scripts/ops/runtime/discord/openclaw-gateway-singleton.mjs\` — Gateway wrapper

## Escalate If

- OpenClaw Gateway does not support voice features
- Discord bot token is invalid or expired
- Voice dependencies cannot be installed
- Bot permissions cannot be granted due to server restrictions
- Issue requires OpenClaw Gateway code changes (outside ANQR scope)`,
  stateId: STATES.todo,
  labelIds: [LABELS.harness],
  priority: 3, // Low priority
  estimate: 3, // Investigation-heavy
};

async function main() {
  try {
    const issue = await createIssue(issueInput);
    console.log(`✅ Created issue: ${issue.identifier} — ${issue.title}`);
    console.log(`   URL: https://linear.app/anqr/issue/${issue.identifier}`);
    console.log(`   State: ${issue.state.name}`);
    console.log(`   Priority: P${issue.priority}`);
    console.log(`   Estimate: ${issue.estimate} points`);
  } catch (err) {
    console.error("❌ Failed to create issue:", err.message);
    process.exit(1);
  }
}

await main();
