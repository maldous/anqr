# Shared Probe Cache System

**Purpose:** Prevent duplicate provider probes when running multiple Symphony executors  
**Location:** `reports/symphony/provider-probe-cache.json`  
**TTL:** 5 minutes  
**Components:** symphony-openai-bridge.mjs, symphony-credit-gate.mjs

## Overview

The Symphony harness runs **8 parallel executors** (wt1-wt8) to handle concurrent AI requests. Previously, each executor independently probed all 38+ providers at startup, resulting in:

- **304 concurrent API probes** (8 executors × 38 providers)
- **Rate limit storms** on shared API gateways (OpenRouter, Gemini, etc.)
- **Wasted resources** re-probing providers already validated by other executors

The **shared probe cache** solves this by storing probe results in a filesystem cache that all executors read from.

## Architecture

### Cache File Structure

```json
{
  "configured": [
    { "name": "gemini-lite", "model": "gemini-2.5-flash-lite", "type": "api", "tier": "free-cloud" },
    { "name": "cerebras", "model": "llama3.1-8b", "type": "api", "tier": "free-cloud" },
    ...
  ],
  "probeResults": [
    { "name": "gemini-lite", "model": "gemini-2.5-flash-lite", "status": "available", "available": true, "durationMs": 234 },
    { "name": "cerebras", "model": "llama3.1-8b", "status": "available", "available": true, "durationMs": 156 },
    { "name": "mistral", "model": "mistral-small-latest", "status": "probe-error", "available": false, "durationMs": 5001 },
    ...
  ],
  "lastProbeAt": "2025-04-03T01:20:05.123Z",
  "probing": false
}
```

### Cache Lifecycle

1. **Startup** — Executor checks cache file
   - **Cache hit (fresh)** → Load probe results, skip expensive probe
   - **Cache miss (none/expired)** → Run full probe, save results

2. **Background probe** (every 30 min OR 200 turns)
   - Check cache age before probing
   - Skip if another executor probed recently
   - Save results to cache after completion

3. **Manual refresh** (`POST /v1/providers/refresh`)
   - Force re-probe regardless of cache AND health state (cooling_down bypassed)
   - Update cache for all executors

## TTL and Freshness

```javascript
const PROBE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
```

**Rationale:**

- Provider availability changes slowly (API keys, quotas, etc.)
- 5 minutes balances freshness vs API quota conservation
- Failed providers have separate cooldown timers (6 min for free, 2 min for paid)

## Integration Points

### symphony-openai-bridge.mjs

```javascript
// Load cache at startup
const cachedProbe = loadProbeCache();
if (cachedProbe) {
  providerStatusCache.configured = cachedProbe.configured;
  providerStatusCache.probeResults = cachedProbe.probeResults;
  providerStatusCache.lastProbeAt = cachedProbe.lastProbeAt;
  logInfo(`📊 Loaded shared probe cache (${age}s old)`);
}

// Save cache after probe
saveProbeCache({
  configured: providerStatusCache.configured,
  probeResults: providerStatusCache.probeResults,
  lastProbeAt: providerStatusCache.lastProbeAt,
  probing: false,
});
```

### symphony-credit-gate.mjs

Exports shared constants:

- `STATE_DIR` — Location for all Symphony state files
- `ensureStateDir()` — Create state directory if missing

## Monitoring

### Check Cache Status

```bash
# View cache file
cat reports/symphony/provider-probe-cache.json | jq .

# Check cache age
jq -r '.lastProbeAt' reports/symphony/provider-probe-cache.json
```

### Watch Probe Behavior

```bash
# Monitor all executors
journalctl --user -u 'anqr-symphony-executor@*.service' -f | grep -E "(probe|cache|Startup)"

# Expected output (cache hit):
# wt1: 🔍 Starting startup exploration (1 cycle)...
# wt2: 📊 Loaded shared probe cache (3s old)
# wt3: Startup probe SKIPPED - using shared cache
```

## Performance Impact

### Startup Time

| Metric          | Before      | After           |
| --------------- | ----------- | --------------- |
| wt1 startup     | 30-60s      | 30-60s (probes) |
| wt2-wt8 startup | 30-60s each | <1s (cache hit) |
| Total API calls | 304         | 38              |
| Rate limit hits | Common      | Rare            |

### Runtime Probe Cycles

Only **1 executor** probes every 30 minutes (whichever hits the timer first). Others skip via cache check.

## Failure Modes

### Cache Corruption

- Executors gracefully fall back to full probe if cache is invalid
- Next successful probe overwrites corrupt cache

### Cache Stale (>5 min)

- Executor treats as cache miss and runs full probe
- Updates cache for other executors

### No Cache (First Start)

- First executor to start runs full probe
- Subsequent executors benefit from cache

## Testing

```bash
# Unit tests (verify no regressions)
npx vitest run harness/ops/integrations/model/symphony-openai-bridge-fallback.spec.ts
npx vitest run harness/ops/integrations/model/symphony-credit-gate.spec.ts

# Integration test (verify cache sharing)
# 1. Delete cache
rm -f reports/symphony/provider-probe-cache.json

# 2. Restart wt1
systemctl --user restart anqr-symphony-executor@1

# 3. Wait for probe to complete, check cache created
ls -lh reports/symphony/provider-probe-cache.json

# 4. Restart wt2 and verify it uses cache
systemctl --user restart anqr-symphony-executor@2
journalctl --user -u anqr-symphony-executor@2 -n 100 | grep cache
```

## Edge Cases

### Race Condition: Multiple Executors Start Simultaneously

- First to acquire file lock (via write) wins
- Others read stale cache briefly, then refresh on next cycle
- **Not harmful** — at worst, 2-3 executors probe instead of 8

### Cache vs In-Memory State

- Each executor maintains its own in-memory `providerStatusCache`
- Cache is only consulted on startup and background probe cycles
- Runtime selection uses in-memory state (faster)

## Related Documentation

- `docs/harness/04-provider-routing.md` — Provider cascade
- `docs/harness/11-adaptive-context.md` — Adaptive context system
- `docs/harness/evidence/OOM-FIX-2025-03-30.md` — Discord notification feedback loop
- `docs/workflows/symphony-execution.md` — Executor architecture

## Maintenance

### Cache File Cleanup

Not needed — cache is always fresh (5 min TTL) and small (<100KB).

### Cache Invalidation

Manual invalidation not needed — executors automatically refresh every 30 minutes.

To force refresh:

```bash
# Option 1: Delete cache + health state (next executor probes from scratch)
rm -f reports/symphony/provider-probe-cache.json reports/symphony/provider-health.json

# Option 2: API endpoint (triggers immediate force probe, bypasses cooling_down)
curl -X POST http://127.0.0.1:4321/v1/providers/refresh -H 'Authorization: Bearer local-symphony'

# Option 3: Full reset (stats + health + cache) then re-probe
make reset-metrics
```
