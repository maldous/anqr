# Workstream G — Evidence, Closure, and Observability Model

> Part of [PLAN.md](./PLAN.md) · Status: ✅ Complete · Started: 2026-04-18 · Completed: 2026-04-18
>
> **Note:** Acceptance criterion #13 (live end-to-end demonstration) is out of scope for G completion. It requires a live system verification and is tracked separately.

## Summary

Workstream G enforces evidence-gated closure: no issue may transition to `completed` without validated evidence artifacts. It builds on the evidence infrastructure from F (17 task-evidence exports, 5 emission paths) and the state model from B (`evidence_pending` phase, transition map). G also resolves carry-forward items from A, E, and F.

## Requirements Addressed

- **R9. Execution completion and workflow completion shall be distinct** — The platform shall distinguish clearly between runner completion, integration completion, evidence publication, and workflow closure.
- **R10. Evidence shall gate closure** — Issue closure and final success status shall require defined evidence artifacts for scheduling, execution, validation, integration, and recovery outcomes where applicable. Missing evidence shall block closure.

## Carry-Forward Items (historical at G start; all resolved below)

| #   | Item                         | Source       | Severity for G                                          | Description                                                                                                                                                                                                                                                                    |
| --- | ---------------------------- | ------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A3  | Alternate executor path      | Workstream A | **Critical** (upgraded from Medium after Phase 0 audit) | `/v1/linear/execute` bypasses `verifySchedulerClaim`. Phase 0 audit confirmed: **ALL evidence is silently lost** on this path — no `createEvidenceRecord` call, every `updateEvidenceRecord` returns null silently. Must wire evidence creation before G Phase 2 closure gate. |
| E4  | Repo-static lifecycle checks | Workstream E | Low–Medium                                              | `checkServiceLifecycle()` inspects repo files, not live host state. G must decide whether closure evidence requires host-runtime proof or repo-static is sufficient.                                                                                                           |
| F5  | Selection rationale          | Workstream F | Medium                                                  | Evidence records final provider selection but not ranked candidates, scores, or policy precedence. Incident-grade reconstruction requires "why was provider A chosen over B."                                                                                                  |
| F7  | Evidence durability          | Workstream F | **High**                                                | All evidence writes are best-effort (`try/catch` with `/* best-effort evidence */`). `updateEvidenceRecord()` has no locking — last-write-wins races possible. G must make evidence reliable enough to gate closure on it.                                                     |

## Current Evidence Infrastructure

### What exists (built in prior workstreams)

**Evidence record lifecycle:**

1. **Created** at ingress — `createEvidenceRecord(correlationId, metadata)` in webhook receiver and discord router
2. **Populated** during execution — routing decision, worktree selection, provider selection, execution result, validation result, push result
3. **Augmented** by bridge — provider routing evidence, context-reduction evidence, safety-net evidence (F)
4. **Loaded** at closeout — `loadEvidenceRecord(correlationId)` in `publish-evidence-and-close.mjs`
5. **Published** to Linear — `buildEvidenceComment()` formats evidence into structured comment

**Evidence modules (17 exports from `task-evidence/index.mjs`):**

- `createEvidenceRecord`, `loadEvidenceRecord`, `saveEvidence`, `updateEvidenceRecord`
- `recordRoutingDecision`, `recordWorktreeSelection`, `recordProviderSelection`
- `recordExecutionResult`, `recordValidationResult`, `recordPushResult`, `recordIntegrationResult`
- `recordProviderRoutingEvidence`, `recordContextReductionEvidence`, `recordSafetyNetEvidence`
- `queryRoutingEvidence`
- `getEvidenceDir`, `getEvidencePath`

**State model support:**

- `evidence_pending` phase in `ISSUE_PHASES` (B Phase 1)
- `evidence_pending_closeout` finalization state maps to `evidence_pending` phase
- Transition: `integration_pending → evidence_pending → completed` (direct `integration_pending → completed` removed in B)
- Self-transition `evidence_pending → evidence_pending` allowed for metadata annotation during retry

**Integrator closure flow (`integrate-candidate.mjs`):**

1. Cherry-pick commit to `symphony/integration` branch
2. Push to `origin/main`
3. Record integration result evidence
4. Transition to `evidence_pending` (finalization: `evidence_pending_closeout`)
5. Call `publishEvidenceAndClose()` — loads evidence, builds comment, posts to Linear, marks Done
6. Transition to `completed` (finalization: `integrated_main`)

### What was missing at G Phase 0 (all resolved)

1. **No evidence completeness validation** — `publishEvidenceAndClose` posts whatever evidence exists but never validates that mandatory fields are present
2. **No closure gate** — the `evidence_pending → completed` transition has no evidence validation; any caller can transition without evidence
3. **Evidence persistence is unreliable** — all evidence writes are best-effort; failure doesn't prevent or delay closure
4. **No mandatory evidence schema** — no defined checklist of what evidence MUST exist for a given lifecycle path
5. **No audit capability** — no way to find issues that closed without complete evidence
6. **Premature completion signals** — Linear issue marked Done and evidence comment posted in same function; if comment fails, Done status persists
7. **Alternate execution paths may skip evidence** — `/v1/linear/execute` (A3) path may not create evidence records

---

## G Phase 0 — Audit Results

> Completed: 2026-04-18 · Method: full code trace of every evidence-producing call site

### Evidence Record Schema

Evidence records are JSON files stored in `$ANQR_EVIDENCE_DIR` (default: `$XDG_RUNTIME_DIR/anqr-task-evidence/`), keyed by `correlationId`. Each record is created by `createEvidenceRecord()` and populated by incremental `updateEvidenceRecord()` calls through the execution lifecycle.

**Persistence model:** `saveEvidence()` writes atomically (tmp file + rename). `loadEvidenceRecord()` returns `null` on any read/parse error. `updateEvidenceRecord()` is load-merge-save with **no locking** — concurrent writers risk last-write-wins data loss.

**Metadata fields (5):**

| Field           | Type       | Set By                         | Description                                     |
| --------------- | ---------- | ------------------------------ | ----------------------------------------------- |
| `correlationId` | string     | `createEvidenceRecord()`       | Primary key linking evidence to issue execution |
| `createdAt`     | ISO string | `createEvidenceRecord()`       | Record creation timestamp                       |
| `updatedAt`     | ISO string | every `updateEvidenceRecord()` | Last modification timestamp                     |
| `watchdog`      | array      | initialized empty              | Reserved for watchdog events                    |
| `events`        | array      | initialized empty              | Reserved for lifecycle events                   |

**Evidence fields (11):**

| #   | Field               | Subfields                                                                                                                              | Set By                             | Lifecycle Stage              |
| --- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------- |
| 1   | `ingress`           | `source`, `receivedAt`, `issueIdentifier`, `requestIdentifier`, `webhookDeliveryId`, `discordThreadId`                                 | `createEvidenceRecord()`           | Ingress                      |
| 2   | `routing`           | `decidedAt`, `targetWorktreePool`, `routingStrategy`, `queuePosition`                                                                  | `recordRoutingDecision()`          | Dispatch                     |
| 3   | `worktreeSelection` | `selectedAt`, `worktreeId`, `reason`                                                                                                   | `recordWorktreeSelection()`        | Dispatch                     |
| 4   | `providerSelection` | `selectedAt`, `providerName`, `model`, `isFallback`, `fallbackReason`                                                                  | `recordProviderSelection()`        | Bridge (pre-LLM)             |
| 5   | `execution`         | `startedAt`, `completedAt`, `durationMs`, `success`, `error`, `filesChanged`                                                           | `recordExecutionResult()`          | Runner                       |
| 6   | `validation`        | `ranAt`, `passed`, `typecheckPassed`, `testsPassed`, `lintPassed`, `errors`                                                            | `recordValidationResult()`         | Runner (post-execution)      |
| 7   | `push`              | `pushedAt`, `branch`, `sha`, `success`, `error`                                                                                        | `recordPushResult()`               | Runner (post-validation)     |
| 8   | `integration`       | `integratedAt`, `mainSha`, `success`, `method`, `error`                                                                                | `recordIntegrationResult()`        | Integrator                   |
| 9   | `providerRouting`   | `decidedAt`, `routeModelId`, `allowedProviders`, `selectedProvider`, `attempts`, `triedProviders`, `hasFallback`, `fallbackChain[]`    | `recordProviderRoutingEvidence()`  | Bridge (post-LLM)            |
| 10  | `contextReduction`  | `recordedAt`, `reductionCount`, `reductions[]`, `finalCap`                                                                             | `recordContextReductionEvidence()` | Bridge (during fallback)     |
| 11  | `safetyNet`         | `activatedAt`, `exhausted`, `triedProviders`, `totalAttempts`, `routeModelId`, `lastError`, `finalContextBudgetCap`, `fallbackChain[]` | `recordSafetyNetEvidence()`        | Bridge (provider exhaustion) |

### Evidence Path Traces

#### Path 1: Standard Linear (webhook → scheduler → router → executor → integrator → closeout)

This is the primary production path. Issues enter via Linear webhook, are scheduled, routed to a worktree, executed by the runner, and integrated to main by the integrator.

```
handle-webhook.mjs:61    → createEvidenceRecord(correlationId, {source: "linear", ...})
  ↓
dispatch-linear-execution.mjs:22  → recordRoutingDecision(correlationId, {targetWorktreePool, routingStrategy})
dispatch-linear-execution.mjs:26  → recordWorktreeSelection(correlationId, {worktreeId, reason})
  ↓  (HTTP POST /v1/linear/execute with x-anqr-correlation-id header)
server.mjs:779           → recordProviderSelection(correlationId, {providerName, model, isFallback})
server.mjs:899/986/1092/1168/1209 → recordProviderRoutingEvidence(correlationId, {...})
server.mjs:1000/1110/1186/1223   → recordContextReductionEvidence(correlationId, reductions)  [conditional]
server.mjs:1104/1180     → recordSafetyNetEvidence(correlationId, {...})  [conditional]
  ↓  (child process: ANQR_CORRELATION_ID env)
execute-issue.mjs:1128   → recordExecutionResult(correlationId, {success, durationMs, filesChanged})
execute-issue.mjs:1285   → recordValidationResult(correlationId, {passed, typecheckPassed, testsPassed})  [if validation runs]
execute-issue.mjs:1514   → recordPushResult(correlationId, {branch, sha, success})  [if push occurs]
  ↓
integrate-candidate.mjs:99/121  → recordIntegrationResult(correlationId, {success, mainSha, method})
publish-evidence-and-close.mjs  → loadEvidenceRecord(correlationId) → buildEvidenceComment → addComment → markDone
```

#### Path 2: Discord Chat (discord router → bridge → LLM response)

Conversational path with no code execution lifecycle. Issues are not created, no runner executes, no integration occurs.

```
process-and-proxy.mjs:18 → createEvidenceRecord(correlationId, {source: "discord", discordThreadId})
process-and-proxy.mjs:23 → recordWorktreeSelection(correlationId, {worktreeId, reason: "least-loaded-discord"})
  ↓  (HTTP proxy to bridge)
server.mjs:779           → recordProviderSelection(correlationId, {providerName, model})
server.mjs:899+          → recordProviderRoutingEvidence(correlationId, {...})
server.mjs:1000+         → recordContextReductionEvidence(correlationId, reductions)  [conditional]
server.mjs:1104+         → recordSafetyNetEvidence(correlationId, {...})  [conditional]
  ↓  (no runner, no integrator, no closeout)
```

#### Path 3: Operator-Direct `/v1/linear/execute` (A3 — bypassing webhook + router)

Privileged path where an external caller POSTs directly to a bridge instance's `/v1/linear/execute` endpoint, bypassing the webhook receiver and router entirely.

```
executeLinearIssueRequest:34  → reads x-anqr-correlation-id header (may be null)
executeLinearIssueRequest:54  → spawns child process with ANQR_CORRELATION_ID env
  ↓  (child process)
execute-issue.mjs:87     → reads process.env.ANQR_CORRELATION_ID
  ↓  ALL subsequent updateEvidenceRecord() calls → loadEvidenceRecord() → returns null → silently returns null
  ↓  evidence silently lost on every call
```

**⚠️ CRITICAL GAP:** No `createEvidenceRecord()` is ever called on this path. Even if a `correlationId` is provided via header, the evidence file does not exist. Every `updateEvidenceRecord()` call loads null and returns null silently. **ALL evidence is lost.**

#### Path 4: Recovery (recovery daemon → classify → repair)

Recovery uses a **completely separate evidence system** unlinked to the task-evidence infrastructure.

```
execute-repair.mjs       → buildEvidence(actionClass, worktreeId, reason, ownershipBasis)
                            Returns: {actionClass, target, reason, ownershipBasis, isStateOnly, isNonPublishing, timestamp}
                            NOT persisted to task-evidence directory
                            Returned as part of repair result for logging

quarantine-and-restart.mjs → writeEvidenceRecord(serviceName, shortName, reason, commit)
                              Writes to: $XDG_RUNTIME_DIR/anqr-watchdog-evidence/ (separate directory)
                              Schema: {timestamp, service, shortName, reason, commit, worktreeId, action, pid}
                              NOT linked to task-evidence by correlationId
```

**Note:** Recovery never closes issues — it quarantines, demotes, or reprovisions worktrees. No closure path means no evidence-gate requirement. However, recovery evidence is not linkable to the original task evidence, which limits incident reconstruction.

### Field Coverage Matrix

| Evidence Field      | Standard Linear |  Discord Chat   | Direct /v1/linear/execute (A3) |       Recovery        |
| ------------------- | :-------------: | :-------------: | :----------------------------: | :-------------------: |
| `ingress`           |    ✅ Always    |    ✅ Always    |        ❌ **MISSING**⁸         | N/A (separate system) |
| `routing`           |   ✅ Guarded¹   |   ❌ Missing²   |         ❌ **MISSING**         |          N/A          |
| `worktreeSelection` |   ✅ Guarded¹   |    ✅ Always    |         ❌ **MISSING**         |          N/A          |
| `providerSelection` |   ✅ Guarded¹   |   ✅ Guarded¹   |       ⚠️ Silently lost³        |          N/A          |
| `execution`         |   ✅ Guarded¹   | N/A (no runner) |       ⚠️ Silently lost³        |          N/A          |
| `validation`        | ⚠️ Conditional⁴ |       N/A       |       ⚠️ Silently lost³        |          N/A          |
| `push`              | ⚠️ Conditional⁵ |       N/A       |       ⚠️ Silently lost³        |          N/A          |
| `integration`       |   ✅ Guarded¹   |       N/A       |       ⚠️ Silently lost³        |          N/A          |
| `providerRouting`   |   ✅ Guarded¹   |   ✅ Guarded¹   |       ⚠️ Silently lost³        |          N/A          |
| `contextReduction`  | ⚠️ Conditional⁶ | ⚠️ Conditional⁶ |       ⚠️ Silently lost³        |          N/A          |
| `safetyNet`         | ⚠️ Conditional⁷ | ⚠️ Conditional⁷ |       ⚠️ Silently lost³        |          N/A          |

**Legend:**

1. ¹ Guarded by `if (correlationId)` — populated when correlationId is present (always true on standard path)
2. ² Discord chat path does not call `recordRoutingDecision()` — acceptable because there is no router dispatch for chat
3. ³ `updateEvidenceRecord()` calls `loadEvidenceRecord()` which returns null (no file) → returns null silently — **evidence silently discarded**
4. ⁴ Only populated if validation actually runs (skip conditions: dry-run, no-change execution)
5. ⁵ Only populated if push occurs (skip conditions: validation failure, dry-run)
6. ⁶ Only populated if context reduction occurs during provider fallback cascade
7. ⁷ Only populated on provider exhaustion (all providers fail)
8. ⁸ Operator-direct path — no `createEvidenceRecord` call; every `updateEvidenceRecord` returns null because file doesn't exist

### Gap Analysis

#### Critical Gaps

| #    | Gap                                                                | Severity    | Impact                                                                                                                                                                                                             | Phase     |
| ---- | ------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| G0-1 | **A3: No evidence record creation on direct `/v1/linear/execute`** | 🔴 Critical | ALL evidence silently lost for operator-initiated executions. `updateEvidenceRecord` returns null on every call because no file exists. No logging of this failure.                                                | G Phase 1 |
| G0-2 | **No evidence completeness validation**                            | 🔴 Critical | `publishEvidenceAndClose` posts whatever evidence exists (even null/empty) without checking mandatory fields. Closure succeeds regardless.                                                                         | G Phase 2 |
| G0-3 | **No closure gate on transition**                                  | 🔴 Critical | `evidence_pending → completed` transition has no evidence validation. Structurally depends on `publishEvidenceAndClose` returning `{ok: true}` but this only checks Linear API success, not evidence completeness. | G Phase 2 |

#### High Gaps

| #    | Gap                                                                | Severity | Impact                                                                                                                                                                       | Phase     |
| ---- | ------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| G0-4 | **Evidence durability: no file locking**                           | 🟠 High  | Concurrent bridge requests updating same correlationId risk last-write-wins data loss. `saveEvidence` atomic write protects against corruption but not against lost updates. | G Phase 1 |
| G0-5 | **`updateEvidenceRecord` silent null return**                      | 🟠 High  | When record doesn't exist, returns null without logging. Callers wrap in `try/catch` with `/* best-effort evidence */` so failure is invisible even in logs.                 | G Phase 1 |
| G0-6 | **`loadEvidenceRecord` cannot distinguish missing from corrupted** | 🟠 High  | Returns null for both "file not found" and "JSON parse error". Closure gate cannot differentiate "no evidence" from "corrupted evidence".                                    | G Phase 1 |

#### Medium Gaps

| #    | Gap                                  | Severity      | Impact                                                                                                                                                                                                                 | Phase                            |
| ---- | ------------------------------------ | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| G0-7 | **Discord chat: no `routing` field** | 🟡 Medium     | `recordRoutingDecision` not called in `process-and-proxy.mjs`. Acceptable for chat (no router dispatch), but means evidence schema varies by path with no explicit documentation.                                      | G Phase 0 (documented, accepted) |
| G0-8 | **Recovery evidence unlinked**       | 🟡 Medium     | Recovery daemon uses separate `buildEvidence()` system writing to different directory (`anqr-watchdog-evidence/`). No correlationId linkage to task-evidence. Limits cross-referencing during incident reconstruction. | G Phase 3 or later               |
| G0-9 | ~~**No selection rationale (F5)**~~  | ~~🟡 Medium~~ | **RESOLVED in G Phase 3.** `selectProvider` now accepts `selectionLog`; `server.mjs` wired on all 5 evidence paths.                                                                                                    | G Phase 3 ✅                     |

#### Low Gaps

| #     | Gap                                                                                        | Severity | Impact                                                                                                             | Phase                           |
| ----- | ------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| G0-10 | **`watchdog` and `events` arrays always empty**                                            | 🟢 Low   | Reserved fields in schema but never populated. No immediate harm but schema carries dead weight.                   | Future                          |
| G0-11 | **Conditional fields (validation, push, contextReduction, safetyNet) not distinguishable** | 🟢 Low   | null means both "didn't happen" and "happened but wasn't recorded". No sentinel value for "intentionally skipped". | G Phase 2 (completeness levels) |

### Mandatory Evidence Schema (Phase 0 Decision)

Based on the audit, the following **mandatory evidence fields for issue closure** are defined. These apply only to the Linear issue execution lifecycle (Standard Linear and A3 paths). Discord chat has no closure path and is exempt.

**`MANDATORY_EVIDENCE_FIELDS` for closure:**

| Field Path                | Required Value  | Rationale                                       |
| ------------------------- | --------------- | ----------------------------------------------- |
| `correlationId`           | non-null string | Links evidence to issue; primary key            |
| `ingress.source`          | non-null string | Proves how the issue entered the system         |
| `ingress.issueIdentifier` | non-null string | Identifies which issue this evidence belongs to |
| `execution.success`       | boolean         | Proves execution completed                      |
| `execution.completedAt`   | ISO string      | Proves execution timing                         |
| `push.success`            | `true`          | Proves code was pushed to worktree branch       |
| `push.branch`             | non-null string | Identifies which branch received the code       |
| `integration.success`     | `true`          | Proves code was integrated to main              |
| `integration.mainSha`     | non-null string | Links to the specific main commit               |

**Conditionally mandatory (required if execution succeeded):**

| Field Path                   | Condition                                   | Rationale                     |
| ---------------------------- | ------------------------------------------- | ----------------------------- |
| `validation.passed`          | if execution.success=true and files changed | Proves code quality gates ran |
| `validation.typecheckPassed` | if validation ran                           | Typecheck is always expected  |
| `validation.testsPassed`     | if validation ran                           | Tests are always expected     |

### Evidence Completeness Levels (Phase 0 Decision)

| Level      | Fields Required                                                                                  | Use Case                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `minimal`  | `correlationId` + `execution` (success/completedAt) + `integration` (success/mainSha)            | Bare minimum to prove execution happened and code reached main. Sufficient for operator-override closure.   |
| `standard` | `minimal` + `ingress` + `push` + `validation` (if applicable) + `routing` or `worktreeSelection` | Expected for all normal-path completions. Proves the full lifecycle chain from ingress through integration. |
| `full`     | `standard` + `providerRouting` + `providerSelection`                                             | Complete evidence including provider routing decisions. Required for incident-grade reconstruction.         |
| `enriched` | `full` + any of: `contextReduction`, `safetyNet`, `selectionRationale` (F5)                      | Maximum evidence including conditional provider behavior. Not required for closure.                         |

### Closure Threshold Decision (Phase 0 Decision)

**Decision: `standard` level gates closure. `minimal` level gates operator-override closure.**

Rationale:

- `minimal` alone is insufficient because it doesn't prove the issue was legitimately scheduled (no ingress) or that code was validated (no validation). But it's enough for operator-override when evidence was lost due to infrastructure issues.
- `standard` proves the complete lifecycle chain and is achievable on every normal-path execution. The only conditional fields (`validation`, `contextReduction`, `safetyNet`) have legitimate skip conditions that the completeness validator can check.
- `full` and `enriched` are advisory — useful for incident reconstruction but not required for closure.

This decision will be implemented in G Phase 2 via `validateEvidenceCompleteness(correlationId, requiredLevel)` and wired into the closure gate in `publishEvidenceAndClose()`.

### Separate Evidence Systems Inventory

| System                | Storage Location                                                       | Schema                                                                                   | Linked to task-evidence? |       Closure-relevant?        |
| --------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | :----------------------: | :----------------------------: |
| **Task evidence**     | `$XDG_RUNTIME_DIR/anqr-task-evidence/{correlationId}.json`             | 11 evidence fields + 5 metadata                                                          |            —             |             ✅ Yes             |
| **Recovery evidence** | In-memory (returned from `buildEvidence()`)                            | `{actionClass, target, reason, ownershipBasis, isStateOnly, isNonPublishing, timestamp}` |          ❌ No           | ❌ No (recovery doesn't close) |
| **Watchdog evidence** | `$XDG_RUNTIME_DIR/anqr-watchdog-evidence/{timestamp}-{shortName}.json` | `{timestamp, service, shortName, reason, commit, worktreeId, action, pid}`               |          ❌ No           | ❌ No (watchdog doesn't close) |

**Decision:** Recovery and watchdog evidence systems remain separate. They serve different purposes (infrastructure health vs task lifecycle) and have no closure path. Cross-linking is a future enhancement, not a G requirement.

---

## Detailed Plan

### G Phase 0 — Evidence Inventory & Completeness Schema (discovery) — ✅ Complete

Audit all evidence-producing code paths. Map which evidence fields are populated on each lifecycle path (success, failure, recovery, alternate executor). Define the mandatory evidence schema for closure.

- [x] **Evidence path audit** — traced evidence creation through all 4 execution paths:
  - Standard Linear: webhook → scheduler → router → executor → integrator → closeout (8/8 core fields populated)
  - Discord Chat: discord router → bridge → LLM response (4/11 fields, no execution lifecycle — correct)
  - Direct `/v1/linear/execute` (A3): **all evidence silently lost** — no `createEvidenceRecord` call (critical gap G0-1)
  - Recovery: separate evidence system, no task-evidence integration, no closure path
- [x] **Field coverage matrix** — complete 11-field × 4-path matrix documented in "G Phase 0 — Audit Results" section above
- [x] **Define `MANDATORY_EVIDENCE_FIELDS`** — 9 mandatory fields + 3 conditionally mandatory fields defined for closure
- [x] **Define evidence completeness levels:** `minimal` → `standard` → `full` → `enriched` (4 levels defined)
- [x] **Decision: evidence completeness threshold for closure** — `standard` gates normal closure; `minimal` gates operator-override closure

### G Phase 1 — Evidence Durability (F7 carry-forward)

Make evidence persistence reliable enough for closure to depend on it. Evidence writes during execution remain best-effort (don't fail the LLM call), but evidence must exist and be complete before closure.

- [x] **Add file-level locking to `updateEvidenceRecord()`** — prevent last-write-wins races when concurrent bridge requests update the same evidence record
  - Created `with-evidence-lock.mjs` using O_EXCL + PID + stale-detection pattern (consistent with `withStoreLock` and `acquireStateLock`)
  - Advisory locking: 40 attempts, 5s stale timeout — degrades to unlocked execution on failure (same as prior behavior)
  - Entire load-merge-save cycle runs under lock to prevent stale-read races
- [x] **Add `ensureEvidenceRecord(correlationId, metadata)`** — creates evidence record if missing, no-op if exists
  - Called at executor startup (before LLM calls) to ensure record exists for population
  - Eliminates race where evidence writers fail because record doesn't exist yet
  - Idempotent: if record already exists, returns it unchanged; if missing, creates skeleton via `createEvidenceRecord()`
- [x] **Add evidence integrity check via `loadEvidenceRecordWithDiagnostics()`** — validate JSON parse, detect corruption
  - Returns `{ status: 'ok', record }`, `{ status: 'missing' }`, or `{ status: 'corrupted', error }` (three-state)
  - Original `loadEvidenceRecord()` unchanged for backward compatibility
  - `updateEvidenceRecord()` now logs corruption warnings to stderr
  - Allows closure gate (Phase 2) to distinguish "no evidence" from "corrupted evidence"
- [x] **A3 carry-forward: wire `ensureEvidenceRecord` into `/v1/linear/execute` path**
  - `executeLinearIssueRequest` now calls `ensureEvidenceRecord(correlationId, { source: "direct-execute", issueIdentifier })` before spawning child process
  - Generates `correlationId` via `randomUUID()` if not provided in header — ALL executions now have evidence records
  - Always sets `ANQR_CORRELATION_ID` env var (no longer conditional)
  - Response status changed from `"completed"` to `"execution_complete"` (Phase 4 — R9)
- [x] **Tests:** evidence locking, ensureEvidenceRecord idempotency, corruption detection, diagnostics three-state return, sequential lifecycle preservation under locking

### G Phase 2 — Evidence Completeness Validation & Closure Gate (core G deliverable) — ✅ Complete

Create the evidence validation function and wire it into the closure path. This is the primary R10 deliverable.

- [x] **Create `validate-evidence-completeness.mjs`** in `task-evidence/`:
  - `validateEvidenceCompleteness(correlationId, requiredLevel = "standard")` → `{ complete: boolean, missing: string[], level: string, status: string }`
  - Loads evidence record via `loadEvidenceRecordWithDiagnostics`, checks mandatory fields per cumulative level
  - `mandatory-evidence-fields.mjs` defines `LEVEL_CHECKS` (per-level field rules), `CONDITIONAL_CHECKS` (validation fields when push exists), `MAX_EVIDENCE_RETRIES` (3)
  - Returns structured result for logging and gate decisions; handles missing/corrupted/ok states
- [x] **Wire validation into `publishEvidenceAndClose()`:**
  - Before posting evidence comment and marking Done, calls `validateEvidenceCompleteness(correlationId, "standard")`
  - If incomplete: self-transitions to `evidence_pending` with `lastError: "incomplete_evidence"`, `missingEvidence`, and incremented `evidenceRetries`
  - Does NOT mark Done — issue stays in `evidence_pending_closeout` for retry
- [x] **Add evidence gate to `evidence_pending → completed` transition:**
  - Verified: `transitionIssue(issueIdentifier, "completed", ...)` only happens after successful `publishEvidenceAndClose` returns `{ ok: true }`
  - `publishEvidenceAndClose` now blocks on incomplete evidence before any Linear API calls
- [x] **Handle permanently missing evidence:**
  - After `MAX_EVIDENCE_RETRIES` (3) retries, `forceCloseWithIncompleteEvidence()` auto-overrides
  - Records `evidenceOverride: { forced, reason, forcedAt, missingFields }` in evidence record
  - Posts evidence comment with `⚠️ Evidence override` warning banner
  - `integrate-candidate.mjs` checks `finalization.evidenceRetries >= MAX_EVIDENCE_RETRIES` before calling force-close
- [x] **Tests:** closure blocked by missing evidence, closure succeeds with complete evidence, operator override architecture, corrupted evidence handling, conditional field checks

### G Phase 3 — Carry-Forward Resolution (E4, F5) — ✅ Complete

Address remaining carry-forward items that affect evidence quality and closure claims.

- [x] **E4 decision: repo-static vs host-runtime lifecycle evidence**
  - **Decision: Option B** — Accept repo-static as sufficient for closure; document limitation
  - Rationale: repo-static checks already validated by config preflight in runner startup (`enforce-config-preflight.mjs`, `validate-startup-env.mjs`). Host-runtime snapshots would add complexity without meaningful closure confidence improvement.
  - Future hardening: Option A can be pursued independently as an enrichment-level evidence field
- [x] **F5: Add provider selection rationale to evidence records**
  - `selectProvider()` now accepts `selectionLog` array parameter — each evaluated provider is logged with `{ name, status, reason, tier }`
  - Statuses: `"selected"`, `"skipped"` (with reason: `not_found`, `not_in_allowed`, `excluded`, health state), `"failed"`, `"safety_net_selected"`
  - `recordProviderRoutingEvidence()` includes `selectionRationale` field for the log
  - Backward-compatible: `selectionLog` is optional; callers that don't provide it see no change
  - `server.mjs` wired: creates `selectionLog` array, passes to `selectProvider`, propagates as `selectionRationale` to all 5 `recordProviderRoutingEvidence` call sites
- [x] **Tests:** selection rationale infrastructure verified (selectProvider supports selectionLog, recordProviderRoutingEvidence includes selectionRationale)

### G Phase 4 — Notification & API Alignment (R9) — ✅ Complete

Ensure no API surface or notification signals workflow completion before evidence closure is actually complete.

- [x] **Audit Linear status transitions:**
  - Confirmed: `STATES.done` is set ONLY in `publishEvidenceAndClose` and `forceCloseWithIncompleteEvidence` (both in integrator, after evidence validation)
  - Runner (`execute-issue.mjs`) never sets `STATES.done` — uses `STATES.inProgress`, `STATES.inReview`, `STATES.todo`, `STATES.backlog` only
  - Architecture guard test verifies runner source does not contain `stateId: STATES.done`
- [x] **Audit Discord notifications:**
  - Runner Discord embed uses `finalStateId` which is set by the runner (In Review/Todo/Backlog) — never Done
  - Discord color is green only if `finalStateId === STATES.done`, which the runner never sets — audit confirms orange/red only from runner
  - Integrator does not send Discord notification on closure (acceptable — Discord notification is execution-stage only)
- [x] **Audit API responses:**
  - Fixed: `executeLinearIssueRequest` response changed from `status: "completed"` to `status: "execution_complete"`
  - Now also returns `correlationId` in response for traceability
  - Bridge responses correctly distinguish execution from workflow completion
- [x] **Tests:** architecture guard confirms runner never sets STATES.done, API response test confirms "execution_complete" not "completed"

### G Phase 5 — Tests, Demonstration & Documentation — ✅ Complete

Comprehensive testing, end-to-end demonstration package, and documentation.

- [x] **Evidence gate tests** (`evidence-closure-gate.spec.ts`):
  - Architecture guards: publishEvidenceAndClose validates before commenting, integrate-candidate uses forceClose, mandatory fields define all levels
  - validateEvidenceCompleteness runtime: missing, corrupted, minimal-complete, minimal-incomplete, standard-complete, full-incomplete, conditional field checks
  - auditEvidenceCompleteness: structured multi-level report, missing record handling
  - findIncompleteEvidence: batch scan finds records missing mandatory fields
  - Phase 4 guards: API response is "execution_complete", runner never sets STATES.done
  - Phase 3 F5 guards: selectProvider supports selectionLog, recordProviderRoutingEvidence includes selectionRationale
- ⬜ **End-to-end lifecycle demonstration** (acceptance criterion #13) — **out of G completion scope**; requires live system verification. Full plan: [PLAN-criterion-13.md](./PLAN-criterion-13.md)
  - Successful: scheduling → execution → validation → push → integration → evidence publication → closure
  - Failure: provider exhaustion → safety-net → evidence captured → issue stays open
  - Recovery: quarantine → repair → no git mutation → evidence of recovery action
  - Restart: process restart → durable state survives → resume from evidence_pending
  - Drift: config drift detected → preflight fails → execution blocked
  - Evidence: full routing evidence with fallback chain, context reduction, selection rationale
- [x] **Evidence audit query** — extend `queryRoutingEvidence` pattern:
  - `auditEvidenceCompleteness(correlationId)` — structured report with completeness at all levels + full record
  - `findIncompleteEvidence(requiredLevel)` — scan evidence directory for records missing mandatory fields
  - Both exported from `task-evidence/index.mjs` and `task-evidence.mjs` facade
- [x] **ADR-0012: Evidence-Gated Closure** (`docs/adrs/0012-evidence-gated-closure.md`):
  - Documents closure authority model, four completeness levels, closure gate location
  - Operator override semantics after MAX_EVIDENCE_RETRIES
  - A3 path fix, F5 selection rationale, E4 decision
- [x] **Update integrator README** with evidence gate documentation

## Implementation Requirements (from original assessment)

**Problem**
Workflow completion is currently signaled before integration and evidence publication are verifiably complete. Missing evidence does not block closure.

**Required change**
Enforce evidence-gated closure: define mandatory evidence artifacts, validate completeness before allowing `evidence_pending → completed` transition, and ensure no API or notification surface prematurely signals completion.

**Expected end state**
For any completed issue, operators can verify that all mandatory evidence exists, that closure was not signaled before evidence publication, and that incomplete evidence blocks or defers closure with a clear audit trail.

**Risks if left unresolved**
Silent evidence loss, closure without proof of validation or integration, weak incident reconstruction, false completion signals to stakeholders, and inability to prove autonomous execution met quality gates.

## Deliverables

- ✅ Mandatory evidence schema and completeness validation (Phase 0: schema defined; Phase 2: validation implementation)
- ✅ Evidence durability improvements (locking, corruption detection, idempotent record creation)
- ✅ Closure gate wired into integrator closeout path (`publishEvidenceAndClose` + `forceCloseWithIncompleteEvidence`)
- ✅ Carry-forward resolution (A3 evidence path fixed, E4 decision documented, F5 selection rationale infrastructure)
- ✅ Notification and API alignment (no premature completion signals — response status + STATES.done audit)
- ✅ Evidence gate tests (`evidence-durability.spec.ts` + `evidence-closure-gate.spec.ts`)
- ✅ ADR-0012 for evidence-gated closure model
- ⬜ End-to-end lifecycle demonstration (requires live system verification)

## Acceptance Criteria

10. ✅ Workflow completion is not signaled until integration and required evidence publication are complete.
11. ✅ Closure fails when mandatory evidence is missing.
12. ⬜ A full end-to-end demonstration exists for: successful authoritative scheduling through integration and closure; duplicate-trigger suppression; recovery quarantine without git mutation; restart-safe resumption; config drift detection; provider fallback with recorded evidence. (Requires live system verification — see [PLAN-criterion-13.md](./PLAN-criterion-13.md))

## Dependencies

- **B state model** — `evidence_pending` phase, transition map, `transitionIssue()` API
- **F evidence infrastructure** — task-evidence module, evidence emission from bridge
- **Integrator** — `integrate-candidate.mjs`, `publish-evidence-and-close.mjs`
- **A scheduler** — `verifySchedulerClaim`, claim enforcement on dispatch paths
- **E config preflight** — `enforce-config-preflight.mjs`, `validate-startup-env.mjs`

## Risks

1. **Evidence locking overhead** — file-level locks on evidence records could slow bridge request handling if contention is high. Mitigation: 5s timeout with fallback to best-effort.
2. **Permanently lost evidence** — if evidence record is corrupted or lost, issue cannot close without operator override. Mitigation: `forceCloseWithIncompleteEvidence()` with audit trail.
3. **A3 scope creep** — wiring full evidence into `/v1/linear/execute` may require significant refactoring of the bridge execution path. Mitigation: document as privileged exception if wiring is disproportionate.
4. **F5 complexity** — `selectProvider()` internals may not cleanly expose ranked candidates. Mitigation: start with what's available (allowed providers, final selection, exclusion reasons) before full scoring.
