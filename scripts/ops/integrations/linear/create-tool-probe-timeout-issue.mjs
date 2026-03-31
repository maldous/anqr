#!/usr/bin/env node

/**
 * create-tool-probe-timeout-issue.mjs — Create Linear issue for tool probe timeout errors
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Symphony bridge: Tool probe timeout errors across multiple providers",
  description: `## Summary

Symphony bridge is experiencing high-frequency tool probe timeout errors (>20 per validation cycle), indicating provider health check failures that may be degrading provider selection quality.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- Harness: Symphony OpenAI bridge (\`symphony-openai-bridge.mjs\`)
- Harness: Provider health probing system
- Harness: Tool probe timeout handling

## Constraints

- **Architecture**: Tool probes are part of provider health validation
- **Performance**: Timeouts add latency to provider selection
- **Cost**: Failed probes may unnecessarily exclude healthy providers

## Problem Statement

Journal logs show recurring tool probe timeouts across multiple providers:

\`\`\`
Apr 01 01:44:01 anqr-symphony-bridge[167436]: [symphony-openai-bridge.mjs:3364] [ERROR] Tool probe timeout exceeded
Apr 01 01:44:01 anqr-symphony-bridge[167436]: [symphony-openai-bridge.mjs:3364] [ERROR] Tool probe timeout exceeded
Apr 01 01:44:01 anqr-symphony-bridge[167436]: [symphony-openai-bridge.mjs:3364] [ERROR] Tool probe timeout exceeded
\`\`\`

**Frequency:** 20-30 timeout errors per provider validation cycle
**Affected providers:** sambanova, github-models, gemini, mistral, openrouter variants
**Current timeout:** 20,000ms (20 seconds)
**Impact:** Providers marked unhealthy despite being functional

## Root Cause Hypotheses

1. **Timeout too aggressive**: 20s insufficient for some providers during cold starts
2. **Network latency**: Provider API endpoints experiencing high latency
3. **Provider throttling**: Silent rate limiting causing slow responses
4. **Probe payload too large**: Tool schema validation taking >20s
5. **Concurrent probe overload**: Too many simultaneous probes saturating network

## Investigation Path

### 1. Timeout Analysis

- [ ] Review timeout distribution: How many probes complete in 15-20s range?
- [ ] Check if timeouts correlate with specific providers or time of day
- [ ] Analyze successful probe latencies to establish baseline

### 2. Provider-Specific Analysis

- [ ] Identify which providers timeout most frequently
- [ ] Check provider status pages for outages/degradation
- [ ] Test probes manually with extended timeout (60s)

### 3. Network Diagnostics

- [ ] Measure network latency to common provider endpoints
- [ ] Check for DNS resolution delays
- [ ] Monitor bandwidth usage during probe cycles

### 4. Probe Configuration

- [ ] Review tool probe payload size
- [ ] Check probe concurrency limits
- [ ] Verify probe retry logic

### 5. Mitigation Options

**Option A: Increase timeout**
- Raise timeout to 30s or 60s
- Risk: Slower provider validation cycles

**Option B: Adaptive timeout**
- Per-provider timeout based on historical latency
- Complexity: Requires state tracking

**Option C: Probe batching**
- Reduce concurrent probes to avoid network saturation
- Trade-off: Longer validation time

**Option D: Graceful degradation**
- Mark provider as "uncertain" instead of "unhealthy" on timeout
- Retry on next cycle instead of immediate exclusion

## Impact

- **Severity**: P2 (Medium) - Degrades provider selection quality
- **Scope**: Provider health validation, all Symphony requests
- **Operational impact**: False negatives in provider health
- **User impact**: Potential fallback to lower-quality providers unnecessarily

## Diagnostic Commands

\`\`\`bash
# Count tool probe timeouts in last 24 hours
journalctl --user -u anqr-symphony-bridge --since "24 hours ago" --no-pager | grep "Tool probe timeout exceeded" | wc -l

# Identify most-affected providers
journalctl --user -u anqr-symphony-bridge --since "24 hours ago" --no-pager | grep "TOOL PROBE TIMEOUT" | awk -F'🕰️ TOOL PROBE TIMEOUT: ' '{print $2}' | awk '{print $1}' | sort | uniq -c | sort -rn

# Check timeout pattern over time
journalctl --user -u anqr-symphony-bridge --since "7 days ago" --no-pager | grep "Tool probe timeout exceeded" | awk '{print $1}' | uniq -c

# Monitor live probe failures
journalctl --user -u anqr-symphony-bridge --no-pager -f | grep -E "(TOOL PROBE TIMEOUT|Tool probe timeout)"

# Test manual probe with extended timeout
# (requires adding debug endpoint or modifying code)
\`\`\`

## Definition Of Done

- [ ] Root cause identified (timeout threshold, network, or provider issue)
- [ ] Timeout threshold adjusted or adaptive timeout implemented
- [ ] Timeout error rate reduced by >80%
- [ ] Provider health validation quality maintained or improved
- [ ] Evidence document with before/after metrics

## Verification

\`\`\`bash
# After fix, verify timeout reduction
journalctl --user -u anqr-symphony-bridge --since "24 hours ago" --no-pager | grep "Tool probe timeout exceeded" | wc -l

# Should be <5 timeouts per day (vs current ~500+)

# Verify provider selection quality hasn't degraded
journalctl --user -u anqr-symphony-bridge --since "24 hours ago" --no-pager | grep "selectProvider" | grep "safety-net" | wc -l

# Should not increase (safety-net should remain rare)
\`\`\`

## Evidence Payload

- Summary: Tool probe timeout investigation and remediation
- Scope class: docs-harness
- Touched paths: \`symphony-openai-bridge.mjs\` probe configuration
- Decisions made: Timeout threshold or adaptive timeout approach
- Commands run: Timeout analysis, provider health validation
- Pass/fail result: Timeout rate <5/day, provider selection quality maintained
- Risk: Medium - affects all Symphony requests
- Follow-up work: Monitor timeout rate, provider health metrics

## Escalate If

- Provider APIs fundamentally unreliable (>50% timeout rate)
- Network infrastructure issues requiring sysadmin intervention
- Tool schema validation performance requires major refactoring`,
  stateId: STATES.todo,
  labelIds: [LABELS.harness],
  priority: 2, // P2 - affects provider selection quality
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
