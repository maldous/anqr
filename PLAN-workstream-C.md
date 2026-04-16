# Workstream C — Recovery Demotion to State-Only Safety Behavior

> Part of [PLAN.md](./PLAN.md) · Status: ✅ Complete · Started: 2026-04-13 · Completed: 2026-04-14

## Summary

All recovery git publication removed (including baseline cspell auto-fix + worktree propagation); `checkBaselineHealth` is detect-only; ADR-0005/ADR-0006/recovery docs aligned.

## Requirements Addressed

- **R2. Recovery shall not publish code** — Recovery shall not perform git add, commit, push, merge, cherry-pick, or any other code-publishing mutation.

## Detailed Progress

- [x] `auto_commit_and_push` demoted to quarantine in `execute-repair.mjs`
- [x] `retry_push` demoted to quarantine in `execute-repair.mjs`
- [x] `classify-worktree.mjs` updated: dirty orphaned → quarantine (not auto-commit)
- [x] Structured evidence emission per ADR-0006 (`buildEvidence` with action class, state-only, non-publishing)
- [x] `isNonPublishing` derived from explicit `NON_PUBLISHING_ACTIONS` set (not hardcoded)
- [x] `reset_to_main` guarded with explicit `leaseIsActive` check (defense-in-depth)
- [x] `attemptCspellAutoFix` deleted — recovery no longer commits/pushes to main
- [x] `propagateBaselineFixToCleanWorktrees` deleted — recovery no longer merges worktrees
- [x] `checkBaselineHealth` rewritten to detect-and-report only (no auto-fix, no git commands)
- [x] Recovery `index.mjs` cleaned of dead exports
- [x] Tests: `recovery-no-git-mutation.spec.ts` — source verification of demoted paths, evidence, and daemon-level non-publication
- [x] Tests: `recovery-behavioral.spec.ts` — behavioral tests exercising real executeRepair
- [x] `reset_to_main` explicitly classified as sandbox maintenance in execute-repair.mjs with documented safety guarantees
- [x] ADR-0005 updated: recovery contains no git add/commit/push/merge anywhere in daemon (including baseline health)
- [x] ADR-0006 updated: entire recovery subsystem follows evidence contract
- [x] Recovery README.md updated: removed deleted file references, reflects detect-only baseline health
- [x] Execute-repair README.md updated with complete action classification table

## Implementation Requirements (from original assessment)

**Problem**
Recovery can currently mutate git state, auto-commit, push, sync, and even affect main-repo state.

**Required change**
Remove all recovery-side git publishing and repository mutation behavior that is outside explicit quarantine or non-publishing repair. Recovery must only classify, quarantine, mark state, request reprovision, or hand work back to the scheduler or operator path.

**Expected end state**
Recovery cannot publish code, cannot become a second git writer, and cannot bypass the runner or integrator lifecycle.

**Implementation notes**

- Delete or disable auto-commit, auto-push, main mutation, and cross-worktree propagation paths.
- Preserve only non-publishing repair operations.
- Add explicit stale-owner and orphan handling that results in quarantine or reassignment, not code mutation.

**Risks if left unresolved**
Unintended code publication, silent corruption of active work, race conditions with live execution, and violation of the intended control model.

## Deliverables

- ✅ Removal of recovery-side commit, push, merge, and publish behavior
- ✅ Quarantine and reprovision workflows
- ✅ Recovery decision documentation
- ✅ Tests proving recovery does not mutate git publish state

## Acceptance Criteria

2. ✅ Recovery code contains no autonomous git publish behavior. Automated tests prove recovery cannot commit, push, or mutate main.

## Completion Review Findings (gpt-5-agent deep audit)

**Verdict: Complete for the no-publication objective. The core requirement (R2) is satisfied.**

### Findings

| # | Finding | Severity | Detail |
|---|---------|----------|--------|
| C1 | "State-only" wording is overclaimed | Low | Recovery still performs sandbox mutation via `reset_to_main` (git fetch/reset/clean) and reprovision workflows. These are non-publishing repair operations, not state-only. The accurate description is: "recovery no longer publishes code; recovery still performs sandbox maintenance mutation." |
| C2 | Tests are mostly source verification | Low | 17 tests are primarily `fs.readFileSync` + string checks. They prove absence of obvious bad code, not runtime behavioral guarantees. Acceptable for the no-publication claim since the deleted modules are truly gone. |
| C3 | Legacy action names remain | Low | `classify-worktree.mjs` still emits `retry_push` as an action name (which `executeRepair` demotes to quarantine). Not a functional bug, but shows the implementation is demoted legacy behavior, not a clean-slate model. |
| C4 | Reprovision path not tested | Low | `reprovisionWorktree()` is called from recovery but not constrained by these tests. Transitive risk is low since reprovision is explicitly an intended recovery action. |

### Impact on Workstream G (historical — G is now ✅ Complete)

- **C is not blocking for G** — the no-publication contract is the real requirement and it is met
- **Clarification for G:** recovery is "non-publishing" not "state-only" — G should not assume recovery can't mutate worktree sandboxes
