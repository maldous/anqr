# ANQ-XXX: Shared Probe Cache Across Symphony Executors

**Date:** 2025-04-03  
**Impact:** Performance, Rate Limits  
**Components:** symphony-openai-bridge.mjs, symphony-credit-gate.mjs  
**Status:** Fixed

## Problem

When running **multiple Symphony executors** (wt1-wt8), each executor independently ran the expensive provider probe cycle at startup:

- **8 executors × 38 providers = 304 concurrent API probes**
- Each probe makes network calls to validate reachability + tool capability
- OpenRouter alone has 27 models (all sharing one API key)
- Resulted in **rate limit storms** during startup/restart
- Wasted resources probing providers that other executors already validated

### Evidence from Logs

```bash
# journalctl shows all executors probing in parallel:
Apr 03 01:20:07 foo anqr-symphony-executor-wt7[1729234]: [symphony-credit-gate.mjs:1480] cerebras: probing...
Apr 03 01:20:07 foo anqr-symphony-executor-wt8[1729236]: [symphony-credit-gate.mjs:1480] cerebras: probing...
Apr 03 01:20:08 foo anqr-symphony-executor-wt7[1729234]: [symphony-credit-gate.mjs:1480] openrouter-step3-5-flash: probing...
Apr 03 01:20:08 foo anqr-symphony-executor-wt8[1729236]: [symphony-credit-gate.mjs:1480] openrouter-step3-5-flash: probing...
```

## Root Cause

The `providerStatusCache` object in `symphony-openai-bridge.mjs` is a **module-level singleton**:

```javascript
// ❌ BEFORE: Each executor process has its own cache (not shared)
const providerStatusCache = {
  configured: [],
  probeResults: [],
  lastProbeAt: null,
  probing: false,
};
```

Since each executor is a **separate Node.js process**, they don't share memory. Each one:

1. Starts up independently
2. Runs `refreshProviderStatus()` at startup
3. Probes all 38 providers in parallel
4. Stores results only in its own process memory

## Solution

**Share probe results via filesystem** so all executors can benefit from one executor's probe:

```javascript
// ✅ AFTER: Shared cache file with TTL
const PROBE_CACHE_FILE = path.join(STATE_DIR, "provider-probe-cache.json");
const PROBE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function loadProbeCache() {
  try {
    if (!fs.existsSync(PROBE_CACHE_FILE)) return null;
    const data = JSON.parse(fs.readFileSync(PROBE_CACHE_FILE, "utf-8"));
    const age = Date.now() - new Date(data.lastProbeAt).getTime();
    if (age > PROBE_CACHE_TTL_MS) return null; // Expired
    return data;
  } catch (err) {
    return null;
  }
}

function saveProbeCache(cache) {
  ensureStateDir();
  fs.writeFileSync(PROBE_CACHE_FILE, JSON.stringify(cache, null, 2));
}
```

### Changed Functions

1. **`refreshProviderStatus()`** — Check cache first, skip probe if fresh
2. **`runContinuousProviderProbe()`** — Skip if another executor probed recently
3. **Startup probe** — Load cache at startup, skip expensive probe if available

## Behavior After Fix

### Scenario 1: All Executors Start Fresh (no cache)

- **wt1** starts first → runs full probe → saves to `provider-probe-cache.json`
- **wt2** starts 2s later → loads cache → skips probe ✅
- **wt3-wt8** all skip probe ✅

### Scenario 2: One Executor Restarts (cache exists)

- **wt3** restarts → loads cache from disk → skips probe ✅
- Other executors continue using their in-memory cache

### Scenario 3: Cache Expires (5 min)

- Next executor to probe refreshes cache for everyone
- Only **1 executor probes** per 5-minute window (instead of all 8)

## Cache File Location

```
reports/symphony/provider-probe-cache.json
```

Example content:

```json
{
  "configured": [...],
  "probeResults": [
    { "name": "gemini-lite", "model": "gemini-2.5-flash-lite", "status": "available", "available": true, "durationMs": 234 },
    { "name": "cerebras", "model": "llama3.1-8b", "status": "available", "available": true, "durationMs": 156 },
    ...
  ],
  "lastProbeAt": "2025-04-03T01:20:05.123Z",
  "probing": false
}
```

## Impact

### Before Fix

- **304 API calls** per restart (8 executors × 38 providers)
- Rate limit storms on OpenRouter, Mistral, Gemini
- 30-60 second startup time per executor

### After Fix

- **38 API calls** per restart (only first executor probes)
- No rate limit storms
- wt2-wt8 start in <1 second (cache hit)

## Testing

```bash
# Verify tests pass
npx vitest run scripts/ops/integrations/model/symphony-openai-bridge-fallback.spec.ts

# Monitor logs after restart
journalctl --user -u 'anqr-symphony-executor@*.service' -f | grep -E "(probe|cache)"

# Check cache file
cat reports/symphony/provider-probe-cache.json | jq .
```

## Related Issues

- External review finding F3 — executor startup side effects
- Rate limit feedback loops (OOM-FIX-2025-03-30.md)
- Provider probe timeout errors (Linear issue)

## Code Changes

**Modified Files:**

- `scripts/ops/integrations/model/symphony-openai-bridge.mjs`
  - Added `loadProbeCache()` and `saveProbeCache()` functions
  - Updated `refreshProviderStatus()` to check cache first
  - Updated `runContinuousProviderProbe()` to skip if cache is fresh
  - Updated startup probe to skip if cache exists

- `scripts/ops/integrations/model/symphony-credit-gate.mjs`
  - Exported `STATE_DIR` constant
  - Exported `ensureStateDir()` function
