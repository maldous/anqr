# ANQ-1375: Discord Router OOM Kills and Overload Protection Fix

## Summary

Fixed critical memory leak and overload protection failure in Discord request router caused by double-decrement bug in error handling.

## Problem Statement

- **OOM frequency:** 2 kills in 7 days (Mar 30, 2026)
- **Overload frequency:** 4 rejections in 24 hours
- **Current memory usage:** ~19MB (MemoryMax was 1G)
- **Root cause:** Double-decrement bug causing counters to go negative

## Root Cause Analysis

### Critical Bug: Double Counter Decrement

In Node.js HTTP, when a proxy request encounters an error, **both** the `error` and `close` events fire. The original code decremented counters in both handlers:

```javascript
proxyReq.on("error", (err) => {
  worktree.activeRequests--;  // First decrement
  globalActiveRequests--;
  ...
});

proxyReq.on("close", () => {
  worktree.activeRequests--;  // Second decrement (BUG!)
  globalActiveRequests--;
  ...
});
```

**Impact:**
1. Counters go negative after errors
2. Overload protection check (`globalActiveRequests >= MAX_CONCURRENT`) fails
3. Router accepts unlimited concurrent requests
4. Memory pressure from unbounded request buffering
5. OOM kill when memory exceeds limit

### Secondary Issues

1. **No request timeouts** — Slow/hung bridges hold resources indefinitely
2. **Full body buffering** — Each request buffers entire payload in memory
3. **No incoming timeout** — Slow clients can keep connections open

## Changes Made

### 1. Fixed Double-Decrement Bug

Introduced completion flag and cleanup function:

```javascript
let completed = false;
const cleanup = () => {
  if (completed) return;
  completed = true;
  worktree.activeRequests--;
  globalActiveRequests--;
};

proxyReq.on("error", cleanup);
proxyReq.on("close", cleanup);
```

### 2. Added Request Timeouts

- **Incoming request timeout:** 120 seconds (2 minutes)
- **Proxy request timeout:** 120 seconds (2 minutes)

Prevents hung connections from holding resources indefinitely.

### 3. Increased Memory Limits

- **MemoryHigh:** 512M → 1G
- **MemoryMax:** 1G → 2G

Provides headroom while counter bug fix prevents unbounded growth.

## Files Modified

1. `scripts/ops/integrations/model/discord-request-router.mjs`
   - Fixed double-decrement with completion flag
   - Added incoming request timeout (120s)
   - Added proxy request timeout (120s)

2. `services/systemd/anqr-discord-router.service`
   - Increased MemoryHigh: 512M → 1G
   - Increased MemoryMax: 1G → 2G

## Validation

### Expected Outcomes

- **OOM kills:** Reduced to <1 per week (target: 0)
- **Overload rejections:** Properly enforced at 4/4 concurrent
- **Memory usage:** Stable over 24-hour period
- **Counter accuracy:** Never goes negative

### Verification Commands

```bash
# Monitor for OOM kills (should be 0)
journalctl --user -u anqr-discord-router --since "7 days ago" --no-pager | grep -c "oom-kill"

# Check memory stability
systemd-cgtop --user | grep anqr-discord-router

# Verify overload protection works correctly
curl http://127.0.0.1:18790/health | jq '.activeRequests, .availableSlots'

# Monitor counter accuracy in logs
journalctl --user -u anqr-discord-router -f | grep -E "(Routing|complete)"
```

## Risk Assessment

- **Severity:** P0 (Critical) — Service downtime affects all Discord users
- **Regression risk:** Low — Changes are isolated to error handling
- **Testing:** Requires service restart to apply systemd memory limits

## Deployment Steps

```bash
# 1. Copy updated service file
cp services/systemd/anqr-discord-router.service ~/.config/systemd/user/

# 2. Reload systemd
systemctl --user daemon-reload

# 3. Restart router (brief downtime)
systemctl --user restart anqr-discord-router.service

# 4. Verify service started
systemctl --user status anqr-discord-router.service
curl http://127.0.0.1:18790/health
```

## Follow-up Work

1. **Monitor OOM rate** — Track for 7 days to confirm fix
2. **Consider streaming** — Long-term optimization: pipe request bodies instead of buffering
3. **Add metrics** — Track peak concurrent requests and memory usage over time
4. **Load testing** — Simulate 8+ concurrent requests to verify 429 responses

## References

- Linear issue: ANQ-1375
- Service file: `services/systemd/anqr-discord-router.service`
- Router code: `scripts/ops/integrations/model/discord-request-router.mjs`
- Architecture doc: `docs/harness/12-concurrent-execution-with-worktrees.md`
