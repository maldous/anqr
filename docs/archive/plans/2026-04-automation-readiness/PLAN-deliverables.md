# Deliverables, Acceptance Criteria, and Definition of Success

> Part of [PLAN.md](./PLAN.md) — the full acceptance framework for workstreams A–H.

## Deliverables

1. **Authoritative scheduling implementation** (Workstream A — ✅)
   - code changes removing runner global self-pick
   - code changes removing reconciler direct dispatch
   - unified scheduler-owned claim and dispatch path
   - scheduler state machine documentation
   - scheduler-focused integration tests

2. **State model implementation** (Workstream B — ✅)
   - authoritative execution-state schema or module contract
   - durable dispatch accounting replacing in-memory correctness dependencies
   - lease, retry, finalization, quarantine, and integration queue invariants in code
   - restart and crash recovery tests

3. **Recovery safety implementation** (Workstream C — ✅)
   - removal of recovery-side commit, push, merge, and publish behavior
   - quarantine and reprovision workflows
   - recovery decision documentation
   - tests proving recovery does not mutate git publish state

4. **Boundary hardening implementation** (Workstream D — ✅ — codex exception accepted per ADR-0008)
   - explicit policy for main-repo execution paths
   - either removed or formally controlled main-repo mutation path
   - service and runtime config updates enforcing boundary rules
   - boundary tests covering worktree-only and approved exception flows

5. **Config and service lifecycle implementation** (Workstream E — ✅)
   - automated config generation or synchronization mechanism
   - drift-detection and preflight validation tooling
   - updated systemd unit and timer definitions
   - startup/runbook documentation
   - tests or verification scripts for config parity and timer exclusivity

6. **Provider-routing and context evidence implementation** (Workstream F — ✅ Complete)
   - routing decision evidence records
   - context-reduction evidence records
   - safety-net activation evidence records
   - post-hoc query capability
   - tests covering fallback, safety-net, reduction, failure, and Codebuff relay paths
   - **Resolved in G:** selection rationale (F5 → G Phase 3), evidence durability (F7 → G Phase 1). Remaining: CLI/HTTP endpoint (F8, Low)

7. **Evidence and closure implementation** (Workstream G — ✅ Complete)
   - lifecycle status model separating execution, integration, and closure
   - mandatory evidence gating in closure paths
   - notification and API wording updates
   - audit tests proving closure fails when evidence is incomplete
   - **Carry-forward from A–F resolved:** A3 alternate executor path (G Phase 1), E4 repo-static decision (G Phase 3), F5 selection rationale (G Phase 3), F7 evidence durability (G Phase 1)

8. **Documentation alignment package** (Workstream H — ✅)
   - updated architecture docs
   - updated README files for affected subsystems
   - updated ADR status or replacement ADRs where current behavior changes
   - updated operational runbooks
   - removed or corrected stale contradictory content

9. **Completion evidence package** (Workstream G — ✅ Complete, except live e2e demo)
   - before/after architecture summary
   - test results
   - service verification outputs
   - drift-check outputs
   - sample lifecycle evidence for a successful issue run and a quarantined failure path

## Acceptance Criteria

| #   | Criterion                                                                                                                                                                                                                                                                            | Status | Workstream                                                                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | There is one and only one scheduler-authoritative code path for global issue admission and claim. No runner, reconciler, or webhook flow can bypass it.                                                                                                                              | ✅     | A — trigger fallback **RESOLVED**; A3 alternate executor path **RESOLVED** in G Phase 1 (ensureEvidenceRecord wired, correlationId generated). `/v1/linear/execute` is a documented operator-privilege path. |
| 2   | Recovery code contains no autonomous git publish behavior. Automated tests prove recovery cannot commit, push, or mutate main.                                                                                                                                                       | ✅     | C                                                                                                                                                                                                            |
| 3   | All scheduling decisions that affect correctness survive process restart and are derived from durable state, not transient counters alone.                                                                                                                                           | ✅     | A, B — durable state is real                                                                                                                                                                                 |
| 4   | Every active issue has one durable owner, one durable lifecycle state, and one documented path for reassignment or quarantine.                                                                                                                                                       | ✅     | B — ~~patchIssueState backdoor weakens authority~~ **RESOLVED** (LIFECYCLE_FIELDS guard); durable ownership via `claimAndAssignWorktree`/`releaseLeaseAndWorktree`                                           |
| 5   | Main-repo mutation is either eliminated from autonomous execution or documented as an explicit exception with code-level enforcement, evidence, and tests.                                                                                                                           | ✅     | D                                                                                                                                                                                                            |
| 6   | Config drift between repo-defined runtime settings and host runtime state is automatically detected and causes validation failure before unsafe operation.                                                                                                                           | ✅     | E — ~~detection works, not wired into production lifecycle~~ **RESOLVED** (blocking gate in runner, advisory in bridge startup)                                                                              |
| 7   | Systemd service and timer behavior is documented and verified for dependency ordering, exclusivity where required, restart behavior, and startup safety.                                                                                                                             | ✅     | E — enforcement-grade repo-static checks (timer overlap, dependency chains, EnvironmentFile). E4 decided: repo-static verification is sufficient for closure (G Phase 3 decision).                           |
| 8   | Provider-routing decisions are logged with enough structured evidence to reconstruct why a provider was chosen and what fallbacks occurred.                                                                                                                                          | ✅     | F — ~~success-path only~~ **RESOLVED** (all 5 paths: streaming/non-streaming success/failure + Codebuff relay); selection rationale **RESOLVED** (F5 → G Phase 3, server.mjs wired)                          |
| 9   | Context reduction is visible in evidence and does not silently masquerade as an unmodified request.                                                                                                                                                                                  | ✅     | F — ~~success-path only, failure-path loses evidence~~ **RESOLVED** (context-reduction evidence emitted on both success and failure paths)                                                                   |
| 10  | Workflow completion is not signaled until integration and required evidence publication are complete.                                                                                                                                                                                | ✅     | G — `publishEvidenceAndClose` gates on `validateEvidenceCompleteness("standard")` before marking Done. API response changed to `"execution_complete"`. Runner never sets `STATES.done`.                      |
| 11  | Closure fails when mandatory evidence is missing.                                                                                                                                                                                                                                    | ✅     | G — `validateEvidenceCompleteness` blocks closure on incomplete evidence. After `MAX_EVIDENCE_RETRIES` (3), `forceCloseWithIncompleteEvidence` auto-overrides with auditable `evidenceOverride` metadata.    |
| 12  | Updated documentation matches implemented behavior for scheduler ownership, recovery limits, state ownership, repo/worktree boundaries, config flow, and lifecycle semantics.                                                                                                        | ✅     | H                                                                                                                                                                                                            |
| 13  | A full end-to-end demonstration exists for: successful authoritative scheduling through integration and closure; duplicate-trigger suppression; recovery quarantine without git mutation; restart-safe resumption; config drift detection; provider fallback with recorded evidence. | ⬜     | G                                                                                                                                                                                                            |

## Documentation and Reality Alignment Requirements

1. The following document classes must be updated whenever affected by implementation changes:
   - architecture overviews
   - subsystem READMEs
   - ADRs or ADR status notes
   - systemd/service lifecycle docs
   - operational runbooks
   - recovery and incident handling docs
   - config and environment setup docs

2. Documentation must describe:
   - ownership boundaries
   - control-flow boundaries
   - state authority
   - retry and idempotency semantics
   - lock and lease semantics
   - recovery behavior
   - repo/worktree boundary rules
   - config synchronization rules
   - evidence and closure rules

3. Any document that describes target-state rather than current-state must say so explicitly.

4. Stale or contradicted documents must be removed, replaced, or marked obsolete in the same delivery that changes the behavior.

5. Pull requests that change scheduler, recovery, state, boundary, provider-routing, config, or lifecycle behavior must include matching documentation changes as blocking deliverables.

6. The final delivery must include a doc-to-code alignment check showing that each critical control claim maps to the implemented subsystem named in the final report and second review.

## Recommended Delivery Sequence

1. ✅ Lock the target control model and define the authoritative scheduler and state model.
2. ✅ Remove runner self-pick and reconciler direct dispatch.
3. ✅ Replace transient dispatch correctness dependencies with durable state.
4. ✅ Remove recovery-side git mutation and publishing behavior.
5. ✅ Harden worktree and main-repo boundary rules.
6. ✅ Automate config propagation and add drift validation.
7. ✅ Tighten service lifecycle and timer safety.
8. ✅ Add provider-routing and context-control evidence.
9. ✅ Enforce closure gating and lifecycle-state precision. (Workstream G)
10. ✅ Update all affected architecture, operations, and subsystem documents. (Workstream H)
11. ⬜ Run full end-to-end verification and produce the completion evidence package. (Workstream G — requires live system; see [PLAN-criterion-13.md](./PLAN-criterion-13.md))

## Final Definition of Success

The platform deserves **high-confidence fit-for-purpose status as a host-local automation harness for complete AI automation** only when all of the following are true:

| Criterion                                                                                                | Status                                                                                                      |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| One authoritative scheduler owns global execution admission                                              | ✅ — A3 resolved in G Phase 1                                                                               |
| Recovery cannot publish code or act as a second git rider                                                | ✅                                                                                                          |
| Local execution truth is durable, singular, and restart-safe                                             | ✅ — patchIssueState guarded, transition helpers enforced, atomic claim+release                             |
| Worktree isolation is the enforced default and any exception is explicit and controlled                  | ✅                                                                                                          |
| Configuration drift is automated away or blocked before unsafe runtime                                   | ✅ — blocking gate in runner, advisory in bridge                                                            |
| Provider routing and context shaping are observable enough for incident-grade reconstruction             | ✅ — all 5 evidence paths covered; selection rationale resolved (F5 → G Phase 3)                            |
| Lifecycle status is precise from dispatch through closure                                                | ✅ — G Phases 0–5 complete                                                                                  |
| Evidence gates closure                                                                                   | ✅ — G Phase 2 closure gate + Phase 4 API alignment                                                         |
| Service lifecycle behavior supports correctness, not only liveness                                       | ✅                                                                                                          |
| Documentation matches implemented reality                                                                | ✅ — H complete (plan-set normalization, README sweep, historical labeling, ADR audit, contradiction sweep) |
| End-to-end tests and evidence prove the above under normal, retry, restart, drift, and failure scenarios | ⬜ — live system verification pending (acceptance criterion #13)                                            |
