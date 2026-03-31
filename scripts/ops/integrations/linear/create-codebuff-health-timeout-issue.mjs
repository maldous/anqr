#!/usr/bin/env node

/**
 * create-codebuff-health-timeout-issue.mjs — Create Linear issue for Codebuff bridge health check timeouts
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Watchdog: Codebuff bridge health check timeouts",
  description: `## Summary

Watchdog service is reporting persistent health check timeouts for the Codebuff bridge, indicating the bridge is either hung, overloaded, or the health endpoint is not responding within timeout.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- Harness: Codebuff bridge (\`anqr-codebuff-bridge.service\`)
- Harness: Watchdog monitor (\`bridge-watchdog.mjs\`)
- Harness: Health check endpoint implementation

## Constraints

- **Architecture**: Health checks are critical for service monitoring
- **Performance**: Health endpoint must respond <5s
- **Reliability**: Watchdog depends on health checks for rollback decisions

## Problem Statement

Journal logs show persistent health check timeout warnings:

\`\`\`
Apr 01 00:33:59 anqr-watchdog[3971895]: [bridge-watchdog.mjs:680] [WARN] [watchdog] ⚠️ codebuff: Service active but unhealthy: health check timeout
Apr 01 00:35:04 anqr-watchdog[3971895]: [bridge-watchdog.mjs:680] [WARN] [watchdog] ⚠️ codebuff: Service active but unhealthy: health check timeout
Apr 01 00:36:09 anqr-watchdog[3971895]: [bridge-watchdog.mjs:680] [WARN] [watchdog] ⚠️ codebuff: Service active but unhealthy: health check timeout
\`\`\`

**Frequency:** Continuous, every 1-2 minutes
**Pattern:** Persistent over hours, not transient
**Service state:** Active (systemd reports running)
**Impact:** Watchdog cannot verify bridge health, may trigger false rollbacks

## Root Cause Hypotheses

1. **Health endpoint hung**: /health endpoint blocked by async operation
2. **Event loop blocked**: Codebuff SDK or tool execution blocking Node.js event loop
3. **Timeout too aggressive**: Health check timeout <5s, bridge needs longer
4. **Resource exhaustion**: Bridge out of memory or CPU-starved
5. **Network issue**: Health check fetch failing at network layer

## Investigation Path

### 1. Health Endpoint Analysis

- [ ] Test health endpoint manually: \`curl -v http://127.0.0.1:4318/health\`
- [ ] Measure response time with \`time curl http://127.0.0.1:4318/health\`
- [ ] Check if endpoint hangs or returns 5xx errors
- [ ] Review health endpoint implementation for blocking operations

### 2. Bridge Process State

- [ ] Check CPU usage: \`top -p $(pgrep -f anqr-codebuff-bridge)\`
- [ ] Check memory usage: \`ps aux | grep anqr-codebuff-bridge\`
- [ ] Check open file descriptors: \`lsof -p $(pgrep -f anqr-codebuff-bridge) | wc -l\`
- [ ] Check for hung async operations: \`kill -SIGUSR1 $(pgrep -f anqr-codebuff-bridge)\` (if signal handler exists)

### 3. Event Loop Monitoring

- [ ] Add event loop lag monitoring to bridge
- [ ] Check for long-running synchronous operations
- [ ] Review tool execution for blocking operations

### 4. Watchdog Configuration

- [ ] Review current health check timeout setting
- [ ] Check health check retry logic
- [ ] Verify watchdog polling interval

### 5. Correlation Analysis

- [ ] Correlate timeouts with Codebuff SDK requests
- [ ] Check if timeouts occur during specific tool executions
- [ ] Review bridge logs around timeout timestamps

## Impact

- **Severity**: P1 (High) - Blocks service health monitoring
- **Scope**: Codebuff bridge health validation
- **Operational impact**: False negative in health checks, potential false rollbacks
- **User impact**: No direct impact unless watchdog triggers incorrect rollback

## Diagnostic Commands

\`\`\`bash
# Test health endpoint manually
curl -v -m 10 http://127.0.0.1:4318/health

# Measure response time
time curl http://127.0.0.1:4318/health

# Check bridge process state
systemctl --user status anqr-codebuff-bridge

# Check resource usage
top -b -n 1 -p $(pgrep -f anqr-codebuff-bridge)

# Count timeout occurrences
journalctl --user -u anqr-watchdog --since "24 hours ago" --no-pager | grep "codebuff: Service active but unhealthy" | wc -l

# Check bridge logs around timeout
journalctl --user -u anqr-codebuff-bridge --since "1 hour ago" --no-pager | tail -50

# Monitor live health check attempts
journalctl --user -u anqr-watchdog --no-pager -f | grep codebuff
\`\`\`

## Definition Of Done

- [ ] Root cause identified (hung endpoint, blocking operation, timeout, or resource issue)
- [ ] Health endpoint responds consistently <5s
- [ ] Watchdog timeout warnings reduced to <5 per day
- [ ] Bridge health monitoring reliable
- [ ] Evidence document with before/after metrics

## Verification

\`\`\`bash
# After fix, verify health endpoint responsiveness
for i in {1..10}; do time curl -s http://127.0.0.1:4318/health; echo; done

# All responses should be <2s

# Verify watchdog timeout reduction
journalctl --user -u anqr-watchdog --since "24 hours ago" --no-pager | grep "codebuff: Service active but unhealthy" | wc -l

# Should be <5 per day (vs current ~700+)
\`\`\`

## Evidence Payload

- Summary: Codebuff bridge health check timeout investigation and remediation
- Scope class: docs-harness
- Touched paths: Health endpoint implementation, watchdog configuration
- Decisions made: Timeout threshold, health endpoint optimization
- Commands run: Health check tests, resource monitoring
- Pass/fail result: Health checks <2s response time, <5 timeouts/day
- Risk: High - affects service monitoring reliability
- Follow-up work: Monitor health check latency, add metrics

## Escalate If

- Bridge fundamentally unstable (frequent crashes or hangs)
- Codebuff SDK has blocking operations that cannot be fixed
- Resource limits need to be increased (memory, CPU)
- Health endpoint architecture needs major refactoring`,
  stateId: STATES.todo,
  labelIds: [LABELS.harness],
  priority: 1, // P1 - blocks health monitoring
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
