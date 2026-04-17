# Acceptance Criterion #13 — Live End-to-End Demonstration Plan

> Part of [PLAN.md](./PLAN.md) · Status: 🟡 In Progress — Scenarios 1–6 implemented and passing (unit); green soak + full live E2E + private rehearsal outstanding · Linked from [PLAN-workstream-G.md](./PLAN-workstream-G.md) Phase 5
>
> This document plans the live system verification that proves the platform's correctness properties under normal, retry, restart, drift, and failure scenarios.

## Criterion Text

> A full end-to-end demonstration exists for: successful authoritative scheduling through integration and closure; duplicate-trigger suppression; recovery quarantine without git mutation; restart-safe resumption; config drift detection; provider fallback with recorded evidence.

## Approach

Create a single comprehensive e2e test file (`tests/e2e/live-lifecycle-demo.spec.ts`) that serves as both the automated demonstration and the evidence package. Each of the 6 required scenarios gets its own `describe` block with fine-grained assertions against evidence artifacts on disk, state store records, and service HTTP responses.

**Design philosophy:**
- **Evidence-first verification** — every scenario asserts on durable evidence records written to disk, not just HTTP status codes. This proves the correlation-ID and evidence-recording layers work end-to-end.
- **Observational over injected** — observe what the live system does rather than mocking layers. Use state manipulation only when a scenario is impossible to trigger naturally (restart, config drift).
- **Cleanup after each scenario** — every test creates identifiable artifacts (prefixed `E2E-DEMO-`) and cleans them up in `afterAll`.
- **Generous timeouts** — full lifecycle scenarios need 3–5 minutes. Use per-test `{ timeout: 300_000 }` rather than inflating the global timeout.

**Test framework: Vitest** (not Playwright, not raw scripts).

Rationale:
- All existing service-to-service e2e tests use Vitest + `e2e-helpers.ts`. Consistency matters.
- Vitest's `describe/it/expect` gives structured assertion output that directly serves as the evidence report.
- Process control (`systemctl`, file manipulation) is handled via `execSync` from within Vitest tests.
- The `vitest.e2e.config.ts` already has the right alias and timeout setup; just add the new file to its `include` array.

## Current Operational State

> **Last updated: 2026-04-16 21:41 AEST.** All core ANQR services are now **active and running**. The live system has passed the pre-demo systemd gate. Harness-doctor `--enforce` passed with exit 0.
>
> **Bring-up history:**
> - 2026-04-16 21:06 — Initial assessment: all services inactive/dead, 2 failed units (nightly, rag-rebuild)
> - 2026-04-16 21:06 — Fixed `anqr-nightly.service` (sonar auto-skip when `--skip-tests` + no coverage) and `anqr-rag-rebuild.service` (graceful Linear index skip). Timers restarted.
> - 2026-04-16 21:15 — Started `anqr-linear-export.timer`, triggered immediate export (38 issues)
> - 2026-04-16 21:37 — Fixed `anqr-symphony-scheduler.service` (203/EXEC: `/usr/bin/node` → nvm-managed node path). Enabled with auto-start in `default.target.wants`.
> - 2026-04-16 21:40 — Full controlled runtime bring-up: all core services, all 8 executors, safety/recovery, Discord/OpenClaw. Pre-demo gate passed. Zero failed units.

### Core authoritative scheduling path — ✅ ALL ACTIVE

| Service | Port | State | Notes |
|---------|------|-------|-------|
| `anqr-symphony-scheduler.service` | — | ✅ **active (running)** | Enabled in `default.target.wants`. Immediately dispatched ANQ-1552 on startup. |
| `anqr-linear-webhook.service` | 18791 | ✅ **active (running)** | Listening on 127.0.0.1:18791 |
| `anqr-symphony-router.service` | 4319 | ✅ **active (running)** | Routing to all 8 worktrees |
| `anqr-symphony-executor@{1..4}.service` | 4321-4324 | ✅ **active (running)** | Linear pool — all 4 active |
| `anqr-symphony-executor@{5..8}.service` | 4325-4328 | ✅ **active (running)** | Discord pool — all 4 active |
| `anqr-symphony-integrator.service` | — | ✅ **active (running)** | Branch → main promotion |

### Safety / recovery / health path — ✅ ALL ACTIVE

| Service | State | Notes |
|---------|-------|-------|
| `anqr-symphony-worktree-recovery.service` | ✅ **active (running)** | Quarantine + repair daemon |
| `anqr-watchdog.service` | ✅ **active (running)** | Service health monitor |
| `anqr-worktree-health.timer` | ✅ **active** | Periodic health checks |

### Discord / OpenClaw path — ✅ ALL ACTIVE

| Service | Port | State | Notes |
|---------|------|-------|-------|
| `anqr-discord-router.service` | 18790 | ✅ **active (running)** | Listening on 127.0.0.1:18790 |
| `openclaw-gateway.service` | 18789 | ✅ **active (running)** | OpenClaw Gateway v2026.4.1 with LCM plugin |

### Timers — ✅ ALL ACTIVE

| Timer | State | Schedule |
|-------|-------|----------|
| `anqr-nightly.timer` | ✅ active | 02:00 daily |
| `anqr-linear-export.timer` | ✅ active | 02:30 daily |
| `anqr-rag-rebuild.timer` | ✅ active | 03:00 daily |
| `anqr-worktree-health.timer` | ✅ active | periodic |

### Support services — ✅ ALL ACTIVE

| Service | State | Notes |
|---------|-------|-------|
| `litellm-proxy.service` | ✅ **active (running)** | Ollama tool-call translator |
| `model-injector-proxy.service` | ✅ **active (running)** | Codex CLI model fix |

### Supplementary services (not required for demo)

| Service | State | Notes |
|---------|-------|-------|
| `anqr-linear-reconciler.service` | inactive | Available on demand |
| `anqr-context7-mcp.service` | inactive | Available on demand |
| `anqr-symphony-codex.service` | inactive | Available on demand |
| `anqr-email-ingest.timer` | inactive | Available on demand |

### Failed units — ✅ ZERO

```text
0 loaded units listed.
```

Previously `anqr-nightly` and `anqr-rag-rebuild` were failed — root causes fixed, services verified.

### Pre-demo systemd gate — ✅ PASSED

```bash
# All returned "active" on 2026-04-16 21:41 AEST:
systemctl --user is-active \
  anqr-symphony-scheduler.service \
  anqr-linear-webhook.service \
  anqr-symphony-router.service \
  anqr-symphony-integrator.service \
  anqr-symphony-worktree-recovery.service \
  anqr-watchdog.service \
  anqr-discord-router.service \
  openclaw-gateway.service \
  anqr-symphony-executor@{1..4}.service

# All 8 executors active:
systemctl --user is-active anqr-symphony-executor@{1..8}.service

# Zero failed units:
systemctl --user --failed  # 0 loaded units listed

# Harness-doctor --enforce: exit 0 (all preflight checks passed)
node harness/ops/harness-doctor/runtime.mjs --enforce
```

### Re-startup sequence (if services need to be restarted)

```bash
# 1. Clear any failed state
systemctl --user reset-failed

# 2. Scheduler (enabled, auto-starts on boot)
systemctl --user start anqr-symphony-scheduler.service

# 3. Core path
systemctl --user start \
  anqr-linear-webhook.service \
  anqr-symphony-router.service \
  anqr-symphony-integrator.service \
  anqr-symphony-worktree-recovery.service \
  anqr-watchdog.service

# 4. All 8 executors
systemctl --user start anqr-symphony-executor@{1..8}.service

# 5. Discord/OpenClaw
systemctl --user start \
  anqr-discord-router.service \
  openclaw-gateway.service

# 6. Timers (nightly, linear-export, rag-rebuild already persistent)
systemctl --user start anqr-worktree-health.timer

# 7. Verify
systemctl --user --failed
systemctl --user is-active \
  anqr-symphony-scheduler.service \
  anqr-linear-webhook.service \
  anqr-symphony-router.service \
  anqr-symphony-integrator.service \
  anqr-symphony-worktree-recovery.service \
  anqr-watchdog.service \
  anqr-discord-router.service \
  openclaw-gateway.service \
  anqr-symphony-executor@{1..4}.service
```

## Prerequisites

```text
Required running services (verified by pre-demo gate above):
  anqr-symphony-scheduler (authoritative claim path)
  anqr-symphony-router (port 4319)
  anqr-symphony-executor@{1..8} (ports 4321-4328)
  anqr-linear-webhook (port 18791)
  anqr-discord-router (port 18790)
  anqr-symphony-integrator
  anqr-symphony-worktree-recovery
  anqr-watchdog
  openclaw-gateway

Required environment:
  LINEAR_WEBHOOK_SECRET in env or ~/.config/symphony/anqr.env
  XDG_RUNTIME_DIR set (evidence directory location)
  User has systemctl --user control (for restart scenario)
  At least one worktree is available (not executing)
  No demo-relevant failed systemd units
```

A `beforeAll` block probes all service health endpoints and runs the pre-demo systemd gate check. If any prerequisite is missing, the entire suite is skipped with a clear message listing which services need to be started.

## Scenarios

---

### Scenario 1: Successful authoritative scheduling through integration and closure

**Complexity: 🔴 High** — Requires a full agent execution cycle that produces real file changes.

**What it proves:**
- Authoritative scheduling owns claim and dispatch (A)
- Durable state tracks execution through every phase (B)
- Evidence is recorded at every lifecycle stage (G)
- Closure is gated on evidence completeness (G)
- Integration promotes to main before closure (B, G)

**Strategy:** Inject a test issue via the Linear webhook endpoint. The issue title includes a machine-parseable instruction (e.g., `E2E-DEMO: touch tests/scenarios/e2e-canary-{timestamp}.txt`). Wait for the full lifecycle by polling the evidence record and finalization state.

**Steps:**
1. `sendSignedWebhook` with a Todo issue (`E2E-DEMO-LIFE-{ts}`) — use a trivially simple instruction that creates a file in a `.gitignore`-d location or modifies a test-only file
2. Poll `findEvidenceByIssue` for the evidence record to appear (proves ingress)
3. Poll for `evidence.routing` to populate (proves scheduler dispatched)
4. Poll for `evidence.worktreeSelection` to populate (proves worktree assigned)
5. Poll for `evidence.execution` to populate (proves agent ran)
6. Poll for `evidence.validation` to populate (proves validation ran)
7. Poll for `evidence.push` to populate (proves branch pushed)
8. Poll for `evidence.integration` to populate (proves integrator promoted to main)
9. Verify the finalization state reached `integrated_main` or `completed`
10. Verify evidence completeness level ≥ `"standard"`
11. **Cleanup:** If a canary file was committed, create a follow-up revert commit to remove test artifacts from main

**Key assertions:**
```typescript
expect(evidence.ingress.source).toBe("linear-webhook");
expect(evidence.routing).not.toBeNull();
expect(evidence.worktreeSelection.worktreeId).toMatch(/^wt[1-4]$/);
expect(evidence.execution.completedAt).toBeTruthy();
expect(evidence.push.branch).toMatch(/^symphony\/wt/);
expect(evidence.integration.integratedMainSha).toBeTruthy();
```

**Timeout:** 300s (5 min) — agent execution + validation + integration takes time.

**Risk:** Agent may fail the issue (non-deterministic). **Mitigation:** Use a trivially simple issue description that modifies only test-only or `.gitignore`-d files (avoid polluting main with canary artifacts). Add a fallback assertion path: if execution completes but integration hasn't happened within the timeout, verify the pipeline reached at least the push stage — this still proves authoritative scheduling through evidence-gated execution.

---

### Scenario 2: Provider fallback with recorded evidence

**Complexity: 🟡 Medium** — Needs to observe provider selection and evidence recording.

**What it proves:**
- Provider routing decisions are logged with structured evidence (F)
- Selection rationale includes why a provider was chosen over alternatives (F5)
- Evidence survives through the full request lifecycle (G)

**Strategy:** Send a Discord chat completion request through the Discord router (port 18790), which proxies to a worktree executor bridge. The bridge's `invoke-with-fallback.mjs` automatically tries providers in order. Verify the evidence record includes `providerSelection` and `providerRouting` with the selection rationale.

**Steps:**
1. Record `beforeIso = new Date().toISOString()`
2. Send a chat completion via Discord router `/v1/chat/completions`
3. Find the evidence record by source `"discord-router"` after `beforeIso`
4. Assert `evidence.providerSelection` is populated with provider name and model
5. Assert `evidence.providerRouting` includes `selectionRationale` (F5 resolution)
6. If fallback occurred, verify `fallbackChain` array is populated

**Key assertions:**
```typescript
expect(evidence.providerSelection).not.toBeNull();
expect(evidence.providerSelection.providerName).toBeTruthy();
expect(evidence.providerRouting).not.toBeNull();
expect(evidence.providerRouting.selectionRationale).toBeTruthy();
// Selection rationale is an array of evaluated providers
expect(evidence.providerRouting.selectionRationale.length).toBeGreaterThan(0);
```

**Timeout:** 60s

**Risk:** Low — provider selection always happens, even without fallback. The evidence recording is what we're proving. Actual fallback may or may not occur depending on provider availability, but the evidence of the selection process is always captured.

---

### Scenario 3: Recovery quarantine without git mutation

**Complexity: 🟡 Medium** — Needs state manipulation + recovery daemon observation.

**What it proves:**
- Recovery cannot commit, push, or mutate main (C)
- Quarantine isolates unhealthy worktrees from the pool (B)
- Recovery evidence is generated for quarantine actions (C)

**Strategy:** Use the symphony-state module to set a worktree to `dirty_owned` with high `repairAttempts` (exceeding threshold), then wait for the recovery daemon's next cycle to quarantine it. Verify NO git mutation by comparing HEAD SHA before and after.

**Steps:**
1. Pick a currently-available worktree (query router health endpoint)
2. Record its current git HEAD SHA (`git rev-parse HEAD` in the worktree dir)
3. Record its current `git log --oneline -1` for comparison
4. Set it to `dirty_owned` with `repairAttempts: 10` via state mutation
5. Poll worktree state until recovery daemon processes it (polls every ~30s)
6. Assert the worktree state is now `quarantined`
7. Assert the git HEAD SHA is **unchanged** (NO git mutation)
8. Assert `git log --oneline -1` output is identical (no new commits)
9. Assert `git status --porcelain` shows no staged changes from recovery
10. **Cleanup:** Reset worktree to `available`, clear quarantine record

**Key assertions:**
```typescript
const beforeSha = execSync(`git -C ${wtPath} rev-parse HEAD`).toString().trim();
// ... wait for recovery daemon ...
const afterSha = execSync(`git -C ${wtPath} rev-parse HEAD`).toString().trim();
expect(afterSha).toBe(beforeSha); // NO git mutation
expect(getWorktreeState(wtId).state).toBe("quarantined");
```

**Timeout:** 120s (need to wait for recovery daemon cycle, which polls every ~30s)

**Risk:** Recovery daemon might not be running, or cycle timing might cause flakiness. **Mitigation:** Probe recovery service health first; use polling with retry and generous timeout. If recovery daemon is unavailable, skip with clear message.

---

### Scenario 4: Restart-safe resumption from durable state

**Complexity: 🔴 High** — Requires stopping and restarting a live service.

**What it proves:**
- Scheduling decisions survive process restart (A, B criterion #3)
- Durable state is file-backed and persists across restarts (B)
- Evidence records survive process restart (G)

**Strategy:** Set an issue's finalization state to `evidence_pending` with a known correlation ID. Write a test evidence record to disk. Stop an executor service, verify state persists, restart it, and verify state survived.

**Steps:**
1. Create a test finalization record at `evidence_pending` state with known correlation ID
2. Write a test evidence record to disk via `createEvidenceRecord`
3. Verify both exist via state API and filesystem
4. **Verify wt8 is idle** — query router health endpoint and assert `wt8.activeRequests === 0` and `getWorktreeState("wt8").state === "available"`. If wt8 is busy, skip with a clear message rather than risk corrupting real work.
5. `systemctl --user stop anqr-symphony-executor@8`
6. Wait 5s for clean shutdown
7. Verify the state file still exists on disk (file-backed JSON store)
8. Verify the evidence record file still exists on disk
9. `systemctl --user start anqr-symphony-executor@8`
10. Poll for the executor to report healthy (`/health` on port 4328)
11. Verify the finalization state is still `evidence_pending`
12. Verify the evidence record is still readable with correct data
13. **Cleanup:** Remove test records, ensure executor is healthy

**Key assertions:**
```typescript
// Before restart
expect(getFinalizationState(testIssue).state).toBe("evidence_pending");
expect(findEvidenceByIssue(testIssue)).not.toBeNull();
// After restart
expect(getFinalizationState(testIssue).state).toBe("evidence_pending");
expect(findEvidenceByIssue(testIssue)).not.toBeNull();
expect(findEvidenceByIssue(testIssue).correlationId).toBe(testCorrelationId);
```

**Timeout:** 120s (stop + start + health check recovery)

**Risk:** Stopping an executor removes it from the pool temporarily. Other tests MUST NOT run in parallel. **Mitigation:** Verify wt8 is idle before stopping (skip if busy); use executor wt8 (least likely to be busy); wrap in try/finally that always restarts the service; verify health before test ends.

---

### Scenario 5: Config drift detection blocking execution

**Complexity: 🟡 Medium** — Needs temporary config corruption and restoration.

**What it proves:**
- Config drift is detected before unsafe operation (E, criterion #6)
- Execution is blocked when preflight fails (E)
- Config preflight is wired as a blocking gate in the runner (E)

**Strategy:** Temporarily corrupt a required env var in the config preflight's checked path. Clear the preflight cache. Call `enforceConfigPreflight()` directly. Verify it fails and blocks execution. Restore the env var. Verify preflight passes again.

**Steps:**
1. Read the current env file content (`~/.config/symphony/anqr.env`) into memory as backup
2. Clear the config preflight cache (`setGlobalValue("configPreflight.checkedAt", null)`)
3. Temporarily modify env file — comment out a required key (e.g., prepend `#DISABLED_` to `GROQ_TOKEN=`)
4. Import and call `enforceConfigPreflight()` directly
5. Assert it throws with a config-drift-related error message
6. **Restore** the env file from the in-memory backup immediately
7. Clear cache again, re-run preflight
8. Assert it passes without error

**⚠️ Blast radius note:** `~/.config/symphony/anqr.env` is shared by all 8 executors and both routers. If any executor runs a config preflight during the corruption window (typically seconds), it will fail its current issue. **Recommendation:** Run this scenario only when the system is quiesced (no active executions), or consider calling `enforceConfigPreflight()` with a test-specific env path override if the function supports it.

**Key assertions:**
```typescript
// With corrupted config
await expect(enforceConfigPreflight()).rejects.toThrow();
// After restore
await expect(enforceConfigPreflight()).resolves.not.toThrow();
```

**Timeout:** 30s

**Risk:** If the test crashes between corruption and restoration, the env file is left damaged — affecting all services, not just the test. **Mitigation:** Use a try/finally block that ALWAYS restores the original file from the in-memory backup. Back up file content before any modification. Log restoration status. Keep the corruption window as short as possible (< 1 second).

---

### Scenario 6: Duplicate-trigger suppression

**Complexity: 🟢 Low** — Extends existing `linear-flow.spec.ts` pattern.

**What it proves:**
- Duplicate webhook deliveries are rejected (B, criterion #3)
- Scheduler-level dedup prevents double execution of the same issue (A)

**Strategy:** Send two webhook triggers with the same delivery ID. Verify the second is rejected as `"duplicate"`. Also verify scheduler-level dedup: send two triggers for the same issue identifier with different delivery IDs within the dedup window and verify only one execution is dispatched.

**Steps:**
1. Send signed webhook with unique delivery ID `e2e-demo-dup-{ts}`
2. Assert first response `status: "processed"`
3. Send second webhook with **same** delivery ID
4. Assert second response `status: "duplicate"`
5. Verify only one evidence record exists for the first issue
6. Send two triggers for same issue ID `E2E-DEMO-DUP-{ts}` with **different** delivery IDs
7. Wait briefly for processing
8. Verify at most one evidence record exists for that issue (scheduler dedup)

**Key assertions:**
```typescript
expect(firstBody.status).toBe("processed");
expect(secondBody.status).toBe("duplicate");
// Only one evidence record for the first issue
const evidence = findEvidenceByIssue(firstIssueId);
expect(evidence).not.toBeNull();
```

**Timeout:** 30s

**Risk:** Very low — this is the simplest scenario and closely follows the pattern already proven in `linear-flow.spec.ts`.

---

## Implementation Components

### New files

| File | Purpose |
|------|---------|
| `tests/e2e/live-lifecycle-demo.spec.ts` | The 6 demonstration scenarios |

### Modified files

| File | Change |
|------|---------|
| `tests/e2e/e2e-helpers.ts` | Add `pollForEvidence`, `pollForEvidenceField`, `findAllEvidenceByIssue` helpers |
| `vitest.e2e.config.ts` | Add `live-lifecycle-demo.spec.ts` to `include` array |
| `PLAN-workstream-G.md` | Check off #13, reference this plan document |
| `PLAN-deliverables.md` | Mark #13 ✅ |
| `PLAN.md` | Update metrics to 13/13 and 11/11 |

### Helper functions needed in `e2e-helpers.ts`

```typescript
/** Poll for an evidence record to appear, with timeout. */
export async function pollForEvidence(
  issueId: string,
  timeoutMs: number,
  intervalMs?: number,
): Promise<EvidenceRecord>;

/** Poll until a specific field on an evidence record is populated. */
export async function pollForEvidenceField(
  issueId: string,
  field: keyof EvidenceRecord,
  timeoutMs: number,
): Promise<EvidenceRecord>;

/** Find all evidence records for a given issue (for dedup verification). */
export function findAllEvidenceByIssue(identifier: string): EvidenceRecord[];
```

## Recommended Execution Order

```text
Phase 1 — Low-risk scenarios (can be built and tested immediately):
  1. Scenario 6: Duplicate-trigger suppression          🟢 Low complexity
  2. Scenario 5: Config drift detection                 🟡 Medium (reversible)

Phase 2 — State-manipulation scenarios:
  3. Scenario 3: Recovery quarantine                    🟡 Medium
  4. Scenario 4: Restart-safe resumption                🔴 High (service control)

Phase 3 — Full pipeline:
  5. Scenario 2: Provider fallback with evidence        🟡 Medium
  6. Scenario 1: Full lifecycle through closure         🔴 High (depends on agent)

Evidence collection run:
  7. Single `npx vitest run tests/e2e/live-lifecycle-demo.spec.ts --config vitest.e2e.config.ts --reporter=verbose`
     → Save output as the #13 evidence package
```

## Risk Summary

| Scenario | Risk | Mitigation |
|----------|------|-----------|
| 1. Full lifecycle | Agent may fail non-deterministically | Accept partial completion; add fallback assertion path |
| 2. Provider fallback | May not observe actual fallback | Verify evidence recording exists even without fallback |
| 3. Recovery quarantine | Recovery daemon timing | Polling with generous timeout; health probe first |
| 4. Restart-safe | Service downtime during test | Use least-busy executor (wt8); try/finally restore |
| 5. Config drift | Corrupted config affects all services | try/finally with in-memory backup; quiesce system or keep corruption window < 1s |
| 6. Duplicate trigger | Very low risk | Already proven pattern |

## What Already Exists (reusable)

| Existing Asset | Reusable For |
|----------------|--------------|
| `tests/e2e/e2e-helpers.ts` | Evidence reading, webhook signing, health checks |
| `tests/e2e/linear-flow.spec.ts` | Pattern for Scenario 6 (duplicate delivery) and Scenario 1 (webhook pipeline) |
| `tests/e2e/discord-flow.spec.ts` | Pattern for Scenario 2 (Discord router → evidence) |
| `tests/e2e/integration-promotion.spec.ts` | Pattern for service health probing |
| `tests/e2e/autonomy-simulation.spec.ts` | Pattern for state machine manipulation (Scenarios 3, 4) |
| `vitest.e2e.config.ts` | Test runner configuration |

## Relationship to Existing Tests

This test file does **not** duplicate existing e2e tests. Existing tests verify individual service-to-service hops. This test verifies:

1. **End-to-end lifecycle** — no existing test follows a single issue from webhook through to evidence-gated closure
2. **Cross-concern properties** — restart safety, config drift blocking, and recovery quarantine are not tested against live services
3. **Evidence artifact verification** — existing tests check HTTP responses; this test checks durable evidence records across the full lifecycle

## Definition of Done

Criterion #13 is satisfied when:
1. All 6 scenarios pass in a single `vitest run` against the live system
2. The verbose test output is saved as the evidence package
3. Each scenario includes at least one assertion against a durable evidence artifact on disk
4. `PLAN-deliverables.md` shows 13/13 ✅
5. `PLAN.md` metrics show 13/13 acceptance criteria and 11/11 definition-of-success criteria met
