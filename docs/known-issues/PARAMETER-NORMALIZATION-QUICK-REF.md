# Parameter Normalization Fix - Quick Reference

## What Changed?

**Before**: `.transform()` (runs after validation) ❌  
**After**: `.preprocess()` (runs before validation) ✅

## Why?

AI SDKs send strings instead of arrays → Zod rejects before transform runs → "Invalid parameters" error

## Tools Fixed (10)

1. `run_file_change_hooks` — `files` parameter
2. `read_files` — `paths` parameter
3. `str_replace` — `replacements` parameter
4. `spawn_agents` — `agents` parameter
5. `propose_str_replace` — `replacements` parameter
6. `read_subtree` — `paths` + `maxTokens` parameters
7. `set_messages` — `messages` parameter
8. `suggest_followups` — `followups` parameter
9. `write_todos` — `todos` parameter
10. `ask_user` — `questions` + nested `options` parameters

## Accepted Input Formats (All Tools)

| Format | Example | Result |
|--------|---------|--------|
| Array | `["a.ts", "b.ts"]` | `["a.ts", "b.ts"]` |
| String | `"a.ts"` | `["a.ts"]` |
| JSON | `'["a.ts"]'` | `["a.ts"]` |
| Object | `{path: "a.ts"}` | `["a.ts"]` |
| Empty | `""` or `null` | `[]` |

## Deployment Commands

```bash
# 1. Check concurrency (must be 0)
curl -s http://127.0.0.1:4319/v1/stats | grep concurrentRequests

# 2. Restart bridge
systemctl --user restart anqr-symphony-bridge

# 3. Verify self-tests (must see 29/29)
journalctl --user -u anqr-symphony-bridge.service -n 100 | grep "self-test"

# 4. Monitor for errors (should be ZERO)
journalctl --user -u anqr-symphony-bridge.service -f | grep "Invalid parameters"
```

## Success: Zero These Errors

- ❌ "Invalid parameters for run_file_change_hooks"
- ❌ "Invalid parameters for str_replace"
- ❌ "Invalid parameters for spawn_agents"
- ❌ "expected array, received string"

## Tests

```bash
# Run normalization tests
npx vitest run scripts/ops/integrations/model/symphony-openai-bridge-normalization.spec.ts

# Run all harness tests
npx vitest run scripts/ops/integrations/model/symphony-*.spec.ts
```

Expected: **171 tests passing** (52 new + 119 existing)

## Commit

```
c7b419e29 - fix(harness): bulletproof array parameter normalization in Symphony Bridge
```

## Documentation

- **Technical**: `docs/known-issues/symphony-bridge-parameter-normalization.md`
- **Summary**: `docs/known-issues/PARAMETER-VALIDATION-FIX-SUMMARY.md`
- **Checklist**: `docs/known-issues/DEPLOYMENT-CHECKLIST.md`
- **This**: `docs/known-issues/PARAMETER-NORMALIZATION-QUICK-REF.md`
