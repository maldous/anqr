#!/usr/bin/env node

/**
 * create-discord-router-oom-issue.mjs — Create Linear issue for Discord router OOM kills
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Discord router: OOM kills and overload protection triggers",
  description: `## Summary

Discord router service is experiencing Out-Of-Memory (OOM) kills and overload protection triggers, indicating memory leaks or insufficient resource limits for current load.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- Harness: Discord request router (\`discord-request-router.mjs\`)
- Harness: Discord router systemd service (\`anqr-discord-router.service\`)
- Harness: Overload protection logic

## Constraints

- **Architecture**: Router must handle concurrent Discord requests to worktrees
- **Performance**: Router is on critical path for Discord interactions
- **Reliability**: OOM kills cause service downtime and request failures

## Problem Statement

Journal logs show recurring OOM kills and overload protection:

\`\`\`
Mar 30 11:00:15 systemd[3686398]: anqr-discord-router.service: Failed with result 'oom-kill'.
Mar 30 14:35:42 systemd[4009431]: anqr-discord-router.service: Failed with result 'oom-kill'.
Mar 31 22:22:27 anqr-discord-router[3817561]: [discord-request-router.mjs:253] [WARN] 🚫 Overload protection: 4/4 active
Mar 31 22:22:27 anqr-discord-router[3817561]: [discord-request-router.mjs:116] [WARN] 🚫 Overload: rejected request (4/4 active)
\`\`\`

**OOM frequency:** 2-3 kills per day
**Overload frequency:** Multiple rejections when all 4 worktrees busy
**Impact:** Service downtime, Discord request failures, user-facing errors

## Root Cause Hypotheses

1. **Memory leak**: Router accumulating state without cleanup
2. **Insufficient memory limit**: Current systemd MemoryMax too low for load
3. **Request buffering**: Large Discord payloads or responses not streamed
4. **Event emitter leaks**: Listeners not being removed after request completion
5. **Worktree connection pooling**: Not closing connections, exhausting resources

## Investigation Path

### 1. Memory Profile Analysis

- [ ] Review current memory limit: \`systemctl --user show anqr-discord-router | grep MemoryMax\`
- [ ] Monitor memory usage over time: \`systemd-cgtop --user\`
- [ ] Check for memory growth pattern before OOM
- [ ] Profile heap usage with Node.js inspector

### 2. Request Volume Analysis

- [ ] Count requests per hour: \`journalctl --user -u anqr-discord-router --since "24 hours ago" | grep -c "🔀 Routing"\`
- [ ] Measure average request payload size
- [ ] Check concurrent request peaks
- [ ] Correlate OOM with request volume spikes

### 3. Code Review

- [ ] Review request lifecycle for cleanup logic
- [ ] Check event emitter listener removal
- [ ] Verify fetch/HTTP client connection pooling
- [ ] Look for global state accumulation

### 4. Systemd Resource Limits

- [ ] Review current limits in \`anqr-discord-router.service\`
- [ ] Check if MemoryMax, TasksMax, or other limits too restrictive
- [ ] Compare with Symphony bridge limits (which doesn't OOM)

### 5. Overload Protection Tuning

- [ ] Review current concurrency limit (4/4)
- [ ] Check if limit should be increased with more memory
- [ ] Verify overload protection logic is correct

## Impact

- **Severity**: P0 (Critical) - Service downtime affects Discord users
- **Scope**: All Discord interactions
- **User impact**: Discord commands fail, requests rejected
- **Operational impact**: Frequent service restarts, reliability concerns

## Diagnostic Commands

\`\`\`bash
# Count OOM kills in last 7 days
journalctl --user -u anqr-discord-router --since "7 days ago" --no-pager | grep -c "oom-kill"

# Check current memory limit
systemctl --user show anqr-discord-router | grep -E "(MemoryMax|MemoryHigh|MemoryCurrent)"

# Monitor live memory usage
systemd-cgtop --user | grep anqr-discord-router

# Check process memory when running
ps aux | grep discord-request-router | awk '{print $6/1024 " MB"}'

# Count overload rejections
journalctl --user -u anqr-discord-router --since "24 hours ago" --no-pager | grep -c "Overload: rejected request"

# Check request volume
journalctl --user -u anqr-discord-router --since "24 hours ago" --no-pager | grep "🔀 Routing" | wc -l

# Monitor live for OOM patterns
journalctl --user -u anqr-discord-router --no-pager -f
\`\`\`

## Mitigation Options

### Option A: Increase Memory Limit (Quick Fix)

\`\`\`ini
# In anqr-discord-router.service
MemoryMax=2G  # Increase from current limit
MemoryHigh=1.5G
\`\`\`

**Pros:** Fast, may resolve OOM immediately
**Cons:** Doesn't fix root cause if leak exists

### Option B: Fix Memory Leak (Permanent)

- Profile heap usage
- Identify accumulating objects
- Add proper cleanup logic
- Test under load

**Pros:** Permanent fix, improves efficiency
**Cons:** Requires debugging time

### Option C: Increase Concurrency Limit

\`\`\`javascript
// In discord-request-router.mjs
const MAX_CONCURRENT = 8; // Increase from 4
\`\`\`

**Pros:** Reduces overload rejections
**Cons:** May increase memory pressure

### Option D: Add Request Streaming

- Stream large payloads instead of buffering
- Use streaming responses
- Reduce peak memory usage per request

**Pros:** Better resource efficiency
**Cons:** Requires architectural changes

## Definition Of Done

- [ ] Root cause identified (leak, limit, or load)
- [ ] OOM kills reduced to <1 per week
- [ ] Overload rejections reduced by >80%
- [ ] Memory usage stable over 24-hour period
- [ ] Evidence document with before/after metrics

## Verification

\`\`\`bash
# After fix, verify OOM reduction
journalctl --user -u anqr-discord-router --since "7 days ago" --no-pager | grep -c "oom-kill"
# Should be 0

# Verify memory stability
systemd-cgtop --user | grep anqr-discord-router
# Memory should not grow continuously

# Verify overload reduction
journalctl --user -u anqr-discord-router --since "24 hours ago" --no-pager | grep -c "Overload: rejected request"
# Should be <5 per day
\`\`\`

## Evidence Payload

- Summary: Discord router OOM and overload investigation and remediation
- Scope class: docs-harness
- Touched paths: \`discord-request-router.mjs\`, \`anqr-discord-router.service\`
- Decisions made: Memory limit increase, leak fix, or concurrency tuning
- Commands run: Memory profiling, OOM analysis, load testing
- Pass/fail result: 0 OOM kills per week, <5 overload rejections per day
- Risk: Critical - affects Discord availability
- Follow-up work: Monitor memory usage, load test at scale

## Escalate If

- Memory leak cannot be found or fixed
- Router architecture fundamentally cannot handle load
- Worktree pool needs to be scaled beyond 8 instances`,
  stateId: STATES.todo,
  labelIds: [LABELS.harness],
  priority: 0, // P0 - service downtime
  estimate: 3,
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
