#!/usr/bin/env node

/**
 * create-bridge-startup-race-issue.mjs — Create Linear issue for bridge initialization race condition
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Bridge initialization race: runners start before startup validation complete",
  description: `## Problem

Symphony runners are starting immediately after bridge restart, resulting in **"Bridge not initialized - startup validation not complete"** errors. This happens because:

1. Bridge restarts (e.g., after \`systemctl restart anqr-symphony-bridge\`)
2. Runners pick up issues from the queue immediately (timer-based, every 2 minutes)
3. Runners attempt to call bridge before \`STARTUP_INITIALIZED = true\`
4. Bridge throws error at line 995 in \`codebuff-openai-bridge.mjs\`:
   \`\`\`javascript
   if (!STARTUP_INITIALIZED) {
     throw new Error("Bridge not initialized - startup validation not complete");
   }
   \`\`\`

## Root Cause

**Race condition**: Runners don't wait for bridge startup probe to complete before attempting to use it.

**Current behavior**:
- \`anqr-symphony-bridge.service\`: Starts and initializes (validates API keys, tests paid/free modes)
- \`anqr-symphony-runner.timer\`: Fires every 2 minutes, doesn't check if bridge is ready
- \`anqr-discord-bridge@.service\`: Starts immediately, may use stale provider cache

**Expected behavior**:
- Runners should NOT start until bridge \`/health\` endpoint returns \`{"status": "ok"}\`
- Discord bridge should start immediately but use previously cached provider selection

## Current Health Check

The bridge exposes \`GET /health\` endpoint:
\`\`\`javascript
function getHealthStatus() {
  return {
    status: STARTUP_INITIALIZED ? "ok" : "initializing",
    model: MODEL_ID,
    apiKeyConfigured: !!getApiKey(),
    mode: (() => {
      if (STARTUP_WINNER?.isPaid) return "paid";
      if (STARTUP_WINNER) return "free";
      return "none";
    })(),
    paramValidationErrors: Object.fromEntries(paramValidationErrorCounts),
  };
}
\`\`\`

**Issue**: Runners don't poll this endpoint before starting work.

## Impact

- **P0 Severity**: Runners fail immediately after bridge restart
- Wastes lease cycles (runner acquires lease, fails, returns to Todo with cooldown)
- Creates noise in logs and Linear comments
- Delays actual issue execution by 2-15+ minutes (cooldown period)

## Solution

### Option 1: Runner Startup Probe (Recommended)

**Modify \`symphony-runner.mjs\`** to check bridge health before picking issues:

\`\`\`javascript
async function waitForBridgeReady(maxWaitMs = 60_000) {
  const startTime = Date.now();
  const bridgeUrl = SYMPHONY_BRIDGE_URL || "http://127.0.0.1:4319";
  
  while (Date.now() - startTime < maxWaitMs) {
    try {
      const res = await fetch(\`\${bridgeUrl}/health\`, {
        signal: AbortSignal.timeout(2000),
      });
      
      if (res.ok) {
        const health = await res.json();
        if (health.status === "ok") {
          logInfo("[runner] ✅ Bridge ready");
          return true;
        }
      }
    } catch {
      // Bridge not ready yet, wait and retry
    }
    
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  
  logWarn("[runner] ⚠️ Bridge did not become ready within timeout");
  return false;
}

// In main() before picking issues:
const bridgeReady = await waitForBridgeReady();
if (!bridgeReady) {
  logError("[runner] Bridge not ready — exiting without picking issues");
  process.exit(0);
}
\`\`\`

**Benefits**:
- Runners wait for bridge to be fully initialized
- No wasted lease cycles
- Clean failure mode (exit early, retry on next timer)
- Reuses existing \`/health\` endpoint

### Option 2: Discord Uses Cached Provider

**Discord bridge should start immediately** using previously cached provider info (from last successful run), avoiding cold-start delays for user interactions.

**Implementation**:
- Cache \`STARTUP_WINNER\` to disk (\`~/.cache/anqr-symphony/last-provider.json\`)
- Discord bridge loads cache immediately on startup
- Background task validates and updates cache asynchronously
- Fallback to startup validation if cache is stale (>1 hour) or missing

### Option 3: Systemd Dependency (Not Recommended)

Add \`After=anqr-symphony-bridge.service\` to runner systemd unit — but this doesn't solve the problem because systemd "After" only controls start order, not readiness.

## Acceptance Criteria

- [ ] Runners wait for bridge \`/health\` endpoint to return \`{"status": "ok"}\` before picking issues
- [ ] No "Bridge not initialized" errors in logs after bridge restart
- [ ] Discord bridge starts immediately using cached provider (optional enhancement)
- [ ] Runner logs show "✅ Bridge ready" message before picking first issue
- [ ] Runner exits cleanly if bridge doesn't become ready within timeout (60s)

## References

- Bridge startup code: \`scripts/ops/integrations/model/codebuff-openai-bridge.mjs\` (line 995)
- Runner main loop: \`scripts/ops/orchestration/symphony-runner.mjs\`
- Health check helper: \`tests/helpers/wait-for-bridge-ready.ts\` (already exists for tests!)
- Systemd units:
  - \`services/systemd/anqr-symphony-bridge.service\`
  - \`services/systemd/anqr-symphony-runner.service\`
  - \`services/systemd/anqr-discord-bridge@.service\`

## Prior Art

The test suite already has \`waitForBridgeReady()\` helper in \`tests/helpers/wait-for-bridge-ready.ts\` — we can reuse this pattern for production runners!`,
  stateId: STATES.todo,
  labelIds: [LABELS.harness, LABELS.reliability],
  priority: 0, // P0 - critical startup issue
  estimate: 5,
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
