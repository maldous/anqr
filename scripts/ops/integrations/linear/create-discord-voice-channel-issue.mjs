#!/usr/bin/env node

/**
 * create-discord-voice-channel-issue.mjs — Create Linear issue for Discord bot voice channel problem
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Discord bot not joining voice channel",
  description: `## Summary

Discord bot is still not joining the voice channel despite previous attempts to configure it.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- Harness: Discord bot integration
- Harness: Voice channel functionality

## Constraints

- **Architecture**: Discord bot voice features require additional dependencies
- **Launch-claim**: Harness only (not product runtime)
- **Human-only**: May require Discord bot permissions configuration or server settings

## Problem Statement

The Discord bot is not joining voice channels when expected. This may be due to:
- Missing voice dependencies (e.g., @discordjs/voice, libsodium-wrappers, ffmpeg)
- Insufficient bot permissions in Discord server settings
- Missing intents configuration (GUILD_VOICE_STATES intent)
- Voice connection code not implemented or not invoked

## Impact

- **Severity**: P3 (Low) - Does not affect core harness functionality
- **Scope**: Harness Discord notifications only
- **User impact**: Voice channel features unavailable

## Investigation Needed

- [ ] Check if Discord bot has voice-related intents enabled
- [ ] Verify bot permissions in Discord server (Connect, Speak permissions)
- [ ] Review Discord bot implementation for voice connection code
- [ ] Check if voice dependencies are installed
- [ ] Test voice connection in isolation

## Definition Of Done

- [ ] Discord bot successfully joins voice channel when requested
- [ ] Voice functionality tested and verified
- [ ] Documentation updated if new dependencies or configuration required

## Verification

\`\`\`bash
# Verify bot implementation
# Check Discord bot permissions in server settings
# Test voice connection
\`\`\`

## Evidence Payload

- Summary: Discord bot voice channel functionality restored
- Scope class: docs-harness
- Touched paths: Discord bot integration scripts
- Decisions made: Voice connection implementation approach
- Commands run: Manual Discord testing
- Pass/fail result: Voice join successful
- Risk: Low - isolated to Discord bot features
- Follow-up work: Monitor voice connection stability

## Escalate If

- Discord API changes require significant refactoring
- Voice dependencies have security vulnerabilities
- Bot permissions cannot be granted due to server restrictions`,
  stateId: STATES.todo,
  labelIds: [LABELS.harness],
  priority: 3, // Low priority
  estimate: 2, // Medium complexity (requires investigation)
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
