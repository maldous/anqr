# Workstream H — Documentation and Reality-Alignment Closure

> Part of [PLAN.md](./PLAN.md) · Status: ✅ Complete · Started: 2026-04-19 · Completed: 2026-04-19

## Summary

Doc-to-code alignment pass across the full plan-set, ADRs, subsystem READMEs, and operational runbooks. The goal is not "better docs" — the goal is: **a reviewer can move from docs to code and observe no material contradiction.**

## Requirements Addressed

- **R12. Documentation shall describe implemented behavior only** — Architecture, operations, recovery, scheduling, state, configuration, and boundary documents shall match implemented behavior. Stale, contradictory, or aspirational claims shall be removed or explicitly marked as target-state, not current-state.

## Scope

Workstream H is a documentation alignment pass, not a writing pass. Criterion #13 (live end-to-end demonstration) is explicitly **out of scope** for H — the original plan already separates them.

## Prioritized Tasks

### H Task 1 — Plan-Set Normalization (✅ Complete)

Ensure PLAN.md, PLAN-deliverables.md, workstream docs, and decisions log all tell the same current-state story.

- [x] PLAN.md: H status updated to "In Progress", G Readiness section retitled to completion record
- [x] PLAN.md: H and G workstream summaries added, test coverage table updated
- [x] PLAN-decisions.md: missing B Phase 3–7, D Phase 3–5, E Phase 3–4, F Phase 3, G Phase 0–5 decisions added
- [x] PLAN-workstream-F.md: missing completion date added
- [x] PLAN-workstream-G.md: #13 exclusion from G completion scope clarified
- [x] Workstream A–F: historical notes added to "Impact on Workstream G" sections
- [x] PLAN-workstream-H.md created

### H Task 2 — README / Architecture Sweep (✅ Complete)

Update READMEs for key subsystems to match current implemented behavior.

Priority subsystems (all verified or updated):
1. Scheduler (`harness/ops/orchestration/symphony-scheduler/`) — already accurate ✅
2. Router (`harness/ops/integrations/model/symphony-agent-router/`) — already accurate ✅
3. Symphony-state (`harness/ops/core/symphony-state/`) — already accurate ✅
4. Integrator (`harness/ops/orchestration/symphony-integrator/`) — already accurate ✅
5. Recovery (`harness/ops/orchestration/symphony-worktree-recovery/`) — already accurate ✅
6. Bridge (`harness/ops/integrations/model/symphony-openai-bridge/`) — already accurate ✅
7. Systemd services (`services/systemd/`) — already accurate ✅
8. Harness-doctor (`harness/ops/harness-doctor/`) — updated with real operational description ✅
9. Task-evidence (`harness/ops/core/task-evidence/`) — updated with full 27-file inventory + ADR-0012 context ✅

### H Task 3 — Historical vs Current-State Labeling (✅ Complete)

Ensure no historical document is mistakenly read as the live status source.

- [x] PLAN-assessment.md: historical banner confirmed sufficient (already present)
- [x] PLAN-original.md: historical banner added (stale D/G/H statuses marked)
- [x] `docs/harness/00-index.md` through `docs/harness/11-*.md`: historical banners added to all 12 pre-implementation architecture review documents, each referencing the relevant ADRs and current subsystem READMEs
- [x] No stale current-state claims found in `docs/standards/` or `docs/workflows/`

### H Task 4 — ADR Status Audit (✅ Complete)

Verify all ADRs match current implementation claims.

- [x] ADR-0001: truth model and status boundary — Status: Accepted, content correct ✅
- [x] ADR-0002: authoritative claim and dispatch — Updated in B Phase 7, includes durable execution ownership section ✅
- [x] ADR-0003: executor pool and worktree boundaries — Updated 2026-04-16 with D enforcement section ✅
- [x] ADR-0004: repo serial integration and candidate admission — Status: Accepted, content correct ✅
- [x] ADR-0005: state-only recovery and divergence policy — Includes sandbox maintenance exception ✅
- [x] ADR-0006: observability audit and evidence contract — Includes recovery evidence requirements ✅
- [x] ADR-0007: quality gates and mutating work admission — Status: Accepted, content correct ✅
- [x] ADR-0008: main repo control bridge and boundary exceptions — Updated 2026-04-16 with D enforcement, 6 defense layers documented ✅
- [x] ADR-0009: host-local configuration authority and sync — Status: Accepted, content correct ✅
- [x] ADR-0010: external symlinks and secrets inventory — Full sensitive file inventory, symlink strategy documented ✅
- [x] ADR-0011: execution state model — Created B Phase 7, three truth domains documented ✅
- [x] ADR-0012: evidence-gated closure — Created G Phase 5, four completeness levels, override mechanism documented ✅

### H Task 5 — Repository-Wide Contradiction Sweep (✅ Complete)

- [x] Stale inventories — task-evidence/README.md updated from 14 to 27 files
- [x] Outdated caveat wording — no "substantially complete" found in current-state docs (only in historical PLAN-assessment.md, which is correctly bannered)
- [x] Removed/renamed module references — `integrationQueue`, `setFinalizationState`, `setWorktreeState` references in docs correctly describe the deprecated/removed status; ADR-0011 explicitly notes `integrationQueue` elimination
- [x] Obsolete "substantially complete" or "ready to start" text — none found in project docs (only in node_modules, which is gitignored)
- [x] Merge conflict markers — none found in tracked project files (only in node_modules)

## Implementation Requirements (from original assessment)

**Problem**
Code still diverged from intended ADR direction in important places. Documentation drift is an engineering problem, not a writing problem.

**Required change**
Update all affected architecture, operations, and subsystem documents. Remove or correct stale contradictory content. Ensure every critical control claim maps to the implemented subsystem.

**Expected end state**
A reviewer can move from docs to code and observe no material contradiction.

**Risks if left unresolved**
Future developers and reviewers misunderstand the actual system behavior. Incident responders follow stale runbooks. Architecture reviews are based on aspirational rather than implemented claims.

## Deliverables

- ✅ Updated architecture docs (docs/harness/00–11 labeled as historical with ADR cross-references)
- ✅ Updated README files for affected subsystems (harness-doctor and task-evidence updated; 7 others verified accurate)
- ✅ Updated ADR status or replacement ADRs where current behavior changes (all 12 ADRs verified correct)
- ✅ Updated operational runbooks (systemd README verified current; docs/harness/10 labeled historical)
- ✅ Removed or corrected stale contradictory content (PLAN-original.md bannered; no stale claims in current-state docs)

## Acceptance Criteria

12. ✅ Updated documentation matches implemented behavior for scheduler ownership, recovery limits, state ownership, repo/worktree boundaries, config flow, and lifecycle semantics.
