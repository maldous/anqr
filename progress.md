# ANQR Hardening Progress

## Slice 1: A+B+C+D — Security, correctness, traceability, restart-safety ✅

### D: Webhook verification fail-closed ✅

- `verify-signature.mjs`: Rejects unsigned/unsecured webhooks by default. Only bypasses with explicit `ANQR_ALLOW_INSECURE_WEBHOOKS=true`.
- `webhook-secret.mjs`: Removed `LINEAR_API_KEY` fallback — only uses `LINEAR_WEBHOOK_SECRET`.
- `anqr-linear-webhook.service`: Removed stale comment about API key.

### A: Durable state (restart-safe, concurrency-safe) ✅

- `durable-kv.mjs`: Added `withStoreLock()` using O_EXCL file locks on all mutating operations.
- `recent-deliveries.mjs`: 1-hour TTL — entries expire naturally, no startup clearing.
- `active-issues.mjs`: 2-hour TTL — entries expire naturally, no startup clearing.
- `runtime.mjs`: Removed all startup clearing and periodic intervals. Clean startup with durable state.

### B: Session continuity (durable, normalized) ✅

- `session-thread-names.mjs`: Replaced in-memory Map with `createDurableMap("discord-session-routes")`.
- `discord-thread-cache.mjs`: Replaced in-memory Map with `createDurableMap("discord-thread-cache")`.
- `evict-expired-sessions.mjs`: Updated for DurableMap API.
- `process-and-proxy.mjs`: Normalized session identity — reads both `x-openclaw-session` and `x-openclaw-session-key`.
- `symphony-openai-bridge/server.mjs`: Same session normalization.

### C: Correlation end-to-end ✅

- `handle-linear-trigger.mjs`: Passes correlationId to dispatch.
- `dispatch-linear-execution.mjs`: Accepts correlationId, records routing decision via task-evidence, forwards to executor.
- `handle-linear-queue.mjs`: Forwards correlationId from queued items.
- `execute-linear-issue-request.mjs`: Passes correlationId to runner subprocess via env.
- `execute-issue.mjs`: Reads `ANQR_CORRELATION_ID` from env, records execution and validation results.
- `integrate-candidate.mjs`: Records integration result with correlationId.

---

## Slice 2: I+H+E — User-path and routing correctness ✅

### I: Discord sanitization ✅

- `invoke-with-fallback-stream.mjs`: Removed `onChunk` error notice that leaked `⚠️ provider failed, trying next provider...` to Discord users. Internal routing errors stay server-side only.
- `sanitize-for-discord-preview.mjs`: Added defensive regex patterns to strip provider selection/fallback noise.

### H: Centralized output validation ✅

- `invoke-with-fallback.mjs`: Added `isInvalidModelAnswerText` check after `invokeCodebuffDirect` returns (non-streaming).
- `invoke-with-fallback-stream.mjs`: Added `isInvalidModelAnswerText` check after `invokeCodebuffDirectStream` returns (streaming).
- Both throw retryable errors with `INVALID_SENTINEL_RESPONSE` code, consistent with `invokeWithAIInner`.

### E: Remove hidden provider preference ✅

- `select-provider.mjs`: Replaced score-boost merge (interleaved preferred/fallback 1:1) with pure ranked order from `getRankedProviders`. Removed dead `preferredNames` parameter.
- `build-selection-options.mjs`: Removed dead `preferredNames` computation, evaluation-sample boosting, and `toolCapableProviders`/`getEvaluationSampleProvider` imports. The ranked order is the single source of truth.
- `build-static-providers.mjs`: Already had `codebuff-paid` (TIER_PAID) and `codebuff-free` (TIER_FREE_CLOUD) as independent providers with separate tiers, cost modes, and session modes.

---

## Slice 3: J+F+G — Runtime hardening ✅

### J: Watchdog targeting ✅

- `monitored-services.mjs`: Added all 8 executor worktrees (wt1-wt8, ports 4321-4328) to watchdog monitoring. Previously only 4 control-plane services were monitored — the actual AI executors were invisible to the watchdog.

### F: Startup probing — No changes needed ✅

- The probe cache (`loadProbeCache` / `applyCacheToStatus`) already persists tool capability results across restarts via shared file cache.
- `nonToolCapableProviders` Set is re-populated from probe results on startup.
- The gap between restart and first probe is covered by the 30s startup grace period.
- `known-tool-capable.mjs` provides a static baseline of 12 known tool-capable providers.

### G: Context/tool budgeting — Already correct ✅

- `invoke-with-aiinner.mjs` already budgets from the full assembled payload:
  - `estimateMessagesTokens(rawMessages)` includes system prompt (it's the first message)
  - `estimateToolOverheadTokens` accounts for tool schema definitions
  - `selectToolsForProvider` dynamically adjusts tool count based on remaining budget
  - `truncateMessagesForProvider` respects both input tokens and tool overhead
- No changes needed.

---

## Slice 4: K+L+docs — Cleanup and proof ✅

### K: Repeated listener registration — No issues found ✅

- All `.on()` patterns are per-request HTTP listeners (req.on('data'), req.on('error')) within request handlers — not accumulating globals.
- `start-context7-server.mjs` has process event listeners attached once during startup — correct.
- No repeated listener registration found anywhere in the harness.

### L: Static hygiene ✅

- `linear-webhook-receiver/index.mjs`: Removed dead `DEDUP_WINDOW_MS` re-export (was used by old runtime interval removed in area A).
- `correlation-id.mjs`: Removed unused `injectCorrelationId` export and `CORRELATION_ID_HEADER` export.
- `task-evidence.mjs`: Removed unused `appendEvidenceEvent`, `recordWatchdogEvent`, `listEvidenceRecords` exports (functions kept as private for potential future use).
- `build-selection-options.mjs`: Removed dead `getProviderStats`, `getEvaluationSampleProvider`, `toolCapableProviders` imports.

---

## Remaining Risks

1. **Pre-existing test failure**: `worktree-recovery.spec.ts` expects `quarantine` but gets `auto_commit_and_push` — unrelated to our changes, pre-existing.
2. **Evaluation sampling disabled**: Removing `preferredNames` from selection options means the evaluation cycle no longer boosts underused providers. This is intentional per the instructions ("no hidden preference"), but means underused providers only get tried when they rank highly on their own merits.
3. **DurableSet iteration**: The `nonToolCapableProviders` Set is spread in `buildSelectionOptions` via `...nonToolCapableProviders`. If this were ever converted to DurableSet, the spread operator must be supported.

---

## Files Changed

### Slice 1 (17 files)

- `harness/ops/lib/durable-kv.mjs` — file locking
- `harness/ops/integrations/model/linear-webhook-receiver/verify-signature.mjs` — fail-closed
- `harness/ops/integrations/model/linear-webhook-receiver/webhook-secret.mjs` — remove fallback
- `harness/ops/integrations/model/linear-webhook-receiver/runtime.mjs` — remove clearing
- `harness/ops/integrations/model/linear-webhook-receiver/recent-deliveries.mjs` — TTL
- `harness/ops/integrations/model/linear-webhook-receiver/active-issues.mjs` — TTL
- `harness/ops/integrations/model/discord-request-router/process-and-proxy.mjs` — session normalization
- `harness/ops/integrations/model/discord-request-router/session-thread-names.mjs` — durable
- `harness/ops/integrations/model/discord-request-router/evict-expired-sessions.mjs` — DurableMap API
- `harness/ops/integrations/model/symphony-agent-router/dispatch-linear-execution.mjs` — correlationId + evidence
- `harness/ops/integrations/model/symphony-agent-router/handle-linear-trigger.mjs` — correlationId
- `harness/ops/integrations/model/symphony-openai-bridge/server.mjs` — session normalization + correlationId
- `harness/ops/integrations/model/symphony-openai-bridge/execute-linear-issue-request.mjs` — correlationId
- `harness/ops/integrations/notifications/openclaw-discord/discord-thread-cache.mjs` — durable
- `harness/ops/orchestration/symphony-runner/execute-issue.mjs` — correlationId + evidence
- `harness/ops/orchestration/symphony-integrator/integrate-candidate.mjs` — correlationId + evidence
- `services/systemd/anqr-linear-webhook.service` — remove stale comment

### Slice 2 (4 files)

- `harness/ops/integrations/model/symphony-openai-bridge/invoke-with-fallback-stream.mjs` — remove Discord noise + output validation
- `harness/ops/integrations/model/symphony-openai-bridge/invoke-with-fallback.mjs` — output validation
- `harness/ops/integrations/model/symphony-openai-bridge/sanitize-for-discord-preview.mjs` — defensive patterns
- `harness/ops/integrations/model/symphony-credit-gate/select-provider.mjs` — pure ranked order

### Slice 3 (1 file)

- `harness/ops/runtime/watchdog/bridge-watchdog/monitored-services.mjs` — add executor worktrees

### Slice 4 (5 files)

- `harness/ops/integrations/model/symphony-openai-bridge/build-selection-options.mjs` — remove dead preferredNames
- `harness/ops/integrations/model/linear-webhook-receiver/index.mjs` — remove dead export
- `harness/ops/lib/correlation-id.mjs` — remove unused exports
- `harness/ops/core/task-evidence.mjs` — remove unused exports
- `progress.md` — this file

**Total: 27 files changed across 4 slices**
