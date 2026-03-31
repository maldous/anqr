#!/usr/bin/env node

/**
 * create-discord-voice-receive-errors-issue.mjs — Create Linear issue for Discord voice receive errors
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Discord voice: High-frequency 'operation was aborted' errors",
  description: `## Summary

Discord voice connection is generating hundreds of "receive error: The operation was aborted" messages in journal logs, indicating unstable voice stream handling.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- Harness: OpenClaw Gateway singleton wrapper
- Harness: Discord bot voice integration
- External: OpenClaw Gateway Discord voice handling

## Constraints

- **Architecture**: Voice functionality is managed by OpenClaw Gateway (external to ANQR)
- **Launch-claim**: Harness only (not product runtime)
- **Human-only**: May require OpenClaw Gateway configuration changes

## Problem Statement

Journal logs show recurring pattern of voice receive errors:

\`\`\`
Mar 31 01:50:04 node[1230592]: [discord] voice: receive error: The operation was aborted
Mar 31 01:50:05 node[1230592]: [discord] voice: receive error: The operation was aborted
Mar 31 01:50:13 node[1230592]: [discord] voice: receive error: The operation was aborted
\`\`\`

**Frequency:** 10-50 errors per minute during active periods
**Pattern:** Clustered bursts, suggests connection instability or timeout issues
**Impact:** Log noise, potential voice feature degradation

## Root Cause Hypotheses

1. **Voice stream timeout**: Audio packets timing out during silence periods
2. **Connection interruption**: Discord voice gateway disconnections
3. **Buffer overflow**: Voice receive buffer not being consumed fast enough
4. **AbortController misuse**: Premature abort signal firing in receive loop
5. **Discord API changes**: Gateway protocol changes requiring OpenClaw update

## Investigation Path

### 1. Log Analysis

- [ ] Count error frequency over 24-hour period
- [ ] Correlate with Discord voice channel activity
- [ ] Check if errors occur during silence or active speech
- [ ] Identify any error recovery attempts

### 2. OpenClaw Gateway Version

- [ ] Check current OpenClaw version: \`npm list @openclaw/gateway\`
- [ ] Review OpenClaw changelog for voice-related fixes
- [ ] Test with latest OpenClaw version if outdated

### 3. Voice Connection Health

- [ ] Monitor voice connection state during errors
- [ ] Check if bot remains in voice channel during error bursts
- [ ] Verify if audio input/output continues working despite errors

### 4. Configuration Review

- [ ] Review voice connection timeout settings
- [ ] Check \`speaking\` event handling configuration
- [ ] Verify voice receive stream options (silence detection, etc.)

### 5. Error Suppression vs Fix

- [ ] If errors are benign (Discord API noise), suppress logging
- [ ] If errors indicate real issues, implement retry/recovery logic
- [ ] Consider adding error rate threshold for alerting

## Impact

- **Severity**: P3 (Low) - Does not block functionality, log noise only
- **Scope**: Discord voice logging
- **User impact**: No direct impact unless voice features are degraded
- **Operational impact**: Journal log pollution, harder to spot real errors

## Diagnostic Commands

\`\`\`bash
# Count voice errors in last 24 hours
journalctl --user --since "24 hours ago" --no-pager | grep "voice: receive error" | wc -l

# Check error pattern over time (hourly buckets)
journalctl --user --since "24 hours ago" --no-pager | grep "voice: receive error" | awk '{print $1, $2}' | uniq -c

# Check if errors correlate with Discord bridge restarts
journalctl --user -u 'anqr-discord-bridge@*.service' --since "24 hours ago" | grep -E "(Started|Stopped|voice: receive error)"

# Check OpenClaw Gateway version
cd ~/.openclaw && npm list @openclaw/gateway

# Monitor live voice errors
journalctl --user --no-pager -f | grep "voice: receive error"
\`\`\`

## Definition Of Done

- [ ] Root cause identified (timeout, connection, buffer, or API change)
- [ ] Solution implemented (fix, upgrade, or suppress logging)
- [ ] Error rate reduced by >90% or errors confirmed benign
- [ ] Voice functionality tested and confirmed working
- [ ] Evidence document with before/after error rates

## Verification

\`\`\`bash
# After fix, verify error rate reduction
journalctl --user --since "24 hours ago" --no-pager | grep "voice: receive error" | wc -l

# Should be <10 errors per day (vs current ~1000+)
\`\`\`

## Evidence Payload

- Summary: Discord voice receive error investigation and remediation
- Scope class: docs-harness
- Touched paths: OpenClaw Gateway configuration, Discord voice integration
- Decisions made: Fix vs suppress logging
- Commands run: Error rate analysis, voice connection tests
- Pass/fail result: Error rate <10/day
- Risk: Low - isolated to Discord voice logging
- Follow-up work: Monitor error rate post-fix

## Escalate If

- OpenClaw Gateway bug requiring upstream fix
- Discord API breaking change requiring major OpenClaw upgrade
- Voice feature completely broken (not just logging noise)`,
  stateId: STATES.todo,
  labelIds: [LABELS.harness],
  priority: 3, // P3 - log noise, not blocking
  estimate: 2,
};

async function main() {
  try {
    const issue = await createIssue(issueInput);
    console.log(`✅ Created issue: ${issue.identifier} — ${issue.title}`);
    console.log(`   URL: https://linear.app/anqr/issue/${issue.identifier}`);
  } catch (err) {
    console.error("❌ Failed to create issue:", err.message);
    process.exit(1);
  }
}

await main();
