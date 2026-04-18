# Symphony Bridge Parameter Validation Fix - Deployment Checklist

**Commit**: c7b419e29  
**Date**: 2025-01-26  
**Urgency**: High (P0 fix for persistent errors)

## Pre-Deployment Checks

- [x] All tests passing (171 tests)
- [x] Changes committed to main branch
- [x] Linting passed (oxlint, cspell, typecheck, ast-density)
- [x] Documentation complete
- [ ] Zero concurrent requests in Discord
- [ ] Bridge restart scheduled

## Deployment Steps

### Step 1: Check Concurrency (CRITICAL)

```bash
# Check Discord for active requests (should be ZERO)
curl -s http://127.0.0.1:4319/v1/stats 2>/dev/null | \
  python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"Concurrent: {data.get('concurrentRequests', {}).get('count', 0)}\")"

# Expected: "Concurrent: 0" or "Bridge not running"
```

**⚠️ DO NOT PROCEED if concurrent count > 0** — wait for requests to complete.

### Step 2: Restart Symphony Bridge

```bash
# Restart the bridge
systemctl --user restart anqr-symphony-bridge

# Expected: Service restarts cleanly
```

### Step 3: Verify Startup Self-Tests

```bash
# Check for self-test results in logs
journalctl --user -u anqr-symphony-bridge.service --no-pager -n 150 | grep "self-test"

# Expected output:
# 🧪 Tool schema self-test: 29/29 passed (all array normalization working)
```

**⚠️ CRITICAL**: If self-tests fail (< 29/29), the bridge will exit with code 1 and refuse to start.

### Step 4: Verify Bridge Health

```bash
# Check health endpoint
curl -s http://127.0.0.1:4319/health | python3 -m json.tool

# Expected: status "ok" with all tools listed
```

### Step 5: Monitor for Validation Errors

```bash
# Monitor logs in real-time for validation errors
journalctl --user -u anqr-symphony-bridge.service -f | grep -E "(Invalid parameters|❌.*error)"

# Expected: ZERO "Invalid parameters" errors
# Allow normal operational errors (rate limits, etc.)
```

**Monitor for at least 5-10 minutes** to ensure no validation errors occur.

### Step 6: Test with Real Requests

```bash
# Send a test request to verify tools work
curl -s http://127.0.0.1:4319/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer local-symphony" \
  -d '{
    "model": "symphony/main",
    "messages": [{"role": "user", "content": "List files in current directory"}],
    "stream": false
  }' | python3 -m json.tool

# Expected: Valid response with list_directory tool execution
```

### Step 7: Update MEMORY.md

```bash
# After successful deployment
echo "Symphony Bridge restarted successfully with parameter normalization fix (commit c7b419e29, 29/29 self-tests passing, zero validation errors)" >> MEMORY.md

git add MEMORY.md
git commit -m "docs(memory): record Symphony Bridge parameter fix deployment"
git push
```

## Success Criteria

✅ Bridge starts successfully  
✅ Self-tests: 29/29 passing  
✅ Health check returns "ok"  
✅ Zero "Invalid parameters" errors in logs  
✅ Test request completes successfully  
✅ All tools available in /health endpoint

## Rollback Procedure (Emergency Only)

If critical issues occur (NOT expected):

```bash
# 1. Revert the commit
git revert c7b419e29 --no-edit

# 2. Restart bridge
systemctl --user restart anqr-symphony-bridge

# 3. Verify rollback
journalctl --user -u anqr-symphony-bridge.service --no-pager -n 50 | grep "Starting"

# 4. Update MEMORY.md
echo "Symphony Bridge parameter fix rolled back due to [REASON]" >> MEMORY.md
git add MEMORY.md
git commit -m "docs(memory): record Symphony Bridge rollback"
git push
```

## Known Safe Error Patterns (Ignore These)

These are **normal operational errors** and not related to this fix:

- ✅ Rate limit errors (429, "rate_limit_exceeded")
- ✅ Payment errors (402, "out of credits")
- ✅ Connection errors ("ECONNREFUSED", network issues)
- ✅ Provider probe failures (expected during startup)

## Known Fixed Error Patterns (Should NOT Appear)

These errors should **NEVER** appear after deployment:

- ❌ "Invalid parameters for run_file_change_hooks"
- ❌ "Invalid parameters for str_replace"
- ❌ "Invalid parameters for spawn_agents"
- ❌ "Invalid parameters for read_files"
- ❌ "expected array, received string" (for any tool)

## Post-Deployment Monitoring

Monitor for 24 hours:

```bash
# Hourly check for validation errors
while true; do
  echo "=== $(date) ==="
  journalctl --user -u anqr-symphony-bridge.service --since "1 hour ago" | \
    grep "Invalid parameters" | wc -l
  echo "validation errors in last hour (should be 0)"
  sleep 3600
done
```

## Contact

If issues arise:

- Check Discord #anqr-harness channel
- Review journalctl logs
- Check /health endpoint
- Verify zero concurrency before any actions

## Reference Documentation

- Technical: `docs/known-issues/symphony-bridge-parameter-normalization.md`
- Summary: `docs/known-issues/PARAMETER-VALIDATION-FIX-SUMMARY.md`
- Tests: `harness/ops/integrations/model/symphony-openai-bridge-normalization.spec.ts`
