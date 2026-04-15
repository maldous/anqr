# Assessment and Requirements

> Part of [PLAN.md](./PLAN.md) — the original assessment that drove workstreams A–F, preserved here for review context.
>
> **Note:** Requirement statuses (R1–R12) and workstream statuses below are updated to reflect current implementation state as of 2026-04-17. The assessment text, headline judgment, and confirmed blocking issues reflect the original pre-implementation review and are preserved intentionally.

## Purpose

This document defines the implementation work required to move the platform from its current state to **high-confidence fit-for-purpose status as a host-local automation harness for complete AI automation**. It is an implementation charter, not a review. It translates the confirmed findings from Review 1, Review 2, and the final source-grounded report into concrete requirements, workstreams, deliverables, and acceptance criteria.

The target outcome is a harness that is operationally trustworthy, deterministic enough for autonomous use, safe in its recovery behavior, explicit in its state ownership, disciplined in its repo and worktree boundaries, and continuously aligned between code, service configuration, and documentation.

## How the Assessment Was Built

**Review 1** was the first documentation-based architecture review. It reconstructed the platform from lighter README material and identified the major risk themes early: split control behavior, under-defined state ownership, concurrency fragility, provider-routing opacity, recovery risk, and weak operational detail. It was directionally correct, but it could not prove how much of the risk was documentation gap versus real implementation gap.

**Review 2** was the second-pass documentation correlation review. It used richer markdown README material to validate or correct the first pass. It increased confidence in the intended architecture by making the runner, integrator, reconciler, worktree fleet, provider-routing layer, systemd topology, Codex path, and OpenClaw config surface explicit. It also confirmed that several of the first-pass concerns were not misunderstandings. They remained active design risks.

The **final report** was the implementation-authoritative stage. It validated the earlier reviews against the actual repository and confirmed that the most serious risk zones still exist in code, not only in documentation. That report is the current-state authority for this requirements document.

This sequence matters because the understanding evolved in three steps:

- Review 1 identified the right architectural pressure points early.
- Review 2 clarified the intended design and narrowed ambiguity.
- The final report established which of those concerns remain materially unresolved in implementation and therefore must drive requirements.

## Headline Current-State Judgment

**The platform is partially fit for purpose as a host-local automation harness, but does not yet deserve high confidence for autonomous operation.**

In practical terms, that means the platform is credible as a real local automation system with worktree execution, integration, provider routing, evidence, and recovery surfaces, but it still lacks the control integrity required for strong autonomous trust. It is suitable for operator-observed use and iterative hardening. It is not yet suitable for high-confidence autonomous execution where correctness, determinism, recovery safety, and clean control boundaries are required.

## Confirmed Blocking Issues

1. **Split scheduler authority** — Work admission and execution can be advanced by multiple actors rather than one authoritative scheduler. → **Addressed by Workstream A**

2. **Recovery acting as a second git rider** — Recovery still performs mutating git operations, including commit and push behavior. → **Addressed by Workstream C**

3. **Split local state ownership** — Operational truth is still split across Linear, filesystem-backed harness state, and transient router memory. → **Addressed by Workstream B**

4. **Manual configuration synchronization risk** — Critical runtime behavior depends on host-local environment files and OpenClaw config being kept in sync outside the repository's transactional boundary. → **Addressed by Workstream E**

5. **Intentional main repo versus worktree isolation exceptions** — The architecture documents worktree isolation as the main safety boundary, but implementation retains explicit main-repo exceptions. → **Addressed by Workstream D**

6. **Provider routing nondeterminism** — Provider selection depends on mutable health, probes, leases, recent history, and fallback state. → **Addressed by Workstream F**

7. **Idempotency, retry, lock ownership, and closure semantics remain insufficiently controlled** — Earlier reviews flagged missing operational guarantees around retries, locks, closure rules, and evidence gating. → **Addressed by Workstreams B + G**

8. **Service lifecycle safety is still too weakly enforced** — The platform has a real systemd topology, but reliability still depends heavily on harness-side repair loops. → **Addressed by Workstream E**

9. **Documentation drift is an engineering problem, not a writing problem** — Code still diverged from intended ADR direction in important places. → **Addressed by Workstream H**

## Requirements for High-Confidence Automation Operation

### R1. Single authoritative scheduler

The platform **shall** have exactly one component that owns global issue admission and the transition from eligible to claimed. No runner, reconciler, webhook handler, or router path may independently self-pick or re-dispatch work outside that authority.

→ **Workstream A: 🟡 Substantially Complete** (~~trigger-path fallback~~ RESOLVED; ~~runner doesn't verify assigned worktree~~ RESOLVED; remaining: A3 alternate executor path)

### R2. Recovery shall not publish code

Recovery **shall not** perform git add, commit, push, merge, cherry-pick, or any other code-publishing mutation. Recovery **shall** be limited to state repair, quarantine, reprovision requests, health marking, and explicit handoff back to the authoritative scheduler or operator workflow.

→ **Workstream C: ✅ Complete**

### R3. One authoritative local execution state model

The platform **shall** define and enforce one authoritative local execution-state model for claims, leases, retries, finalization, integration candidacy, quarantine, and recovery ownership. Linear, local state, and in-memory router counters **shall not** be competing truth domains for execution authority.

→ **Workstream B: 🟡 Substantially Complete** (~~`patchIssueState` backdoor~~ RESOLVED via LIFECYCLE_FIELDS guard; ~~closure gating not enforced~~ RESOLVED — `integration_pending → completed` removed; remaining: heartbeatLease bypass, mocked atomicity)

### R4. Durable and bounded dispatch accounting

All execution-dispatch accounting that affects scheduling decisions **shall** be durable, restart-safe, and reconciled against real execution state. In-memory-only counters **shall not** be relied on for scheduler correctness.

→ **Workstreams A + B: 🟡 Substantially Complete**

### R5. Worktree isolation shall be the default and enforced boundary

All code-changing autonomous execution **shall** occur in explicitly managed worktrees unless a documented exception is approved, justified, constrained, and enforced by code. Main-repo execution paths **shall** either be removed or converted into tightly bounded exception flows with their own controls and evidence.

→ **Workstream D: 🟡 Substantially Complete** (codex exception is accepted design choice per ADR-0008)

### R6. Configuration synchronization shall be automated or eliminated

The platform **shall not** depend on manual synchronization of critical runtime configuration across repository files, host environment files, and OpenClaw runtime config. Config propagation **shall** be automated, validated, and drift-detectable.

→ **Workstream E: 🟡 Substantially Complete** (~~tooling exists, not wired into operational lifecycle~~ RESOLVED — blocking gate in runner, advisory in bridge; remaining: repo-static lifecycle checks)

### R7. Provider routing shall be policy-bounded and observable

Provider selection **shall** have explicit precedence rules, bounded fallback behavior, stable audit output, and operator-verifiable selection evidence. Adaptive routing may remain heuristic, but it **shall** be explainable and reproducible enough for incident analysis.

→ **Workstream F: ✅ Complete** (~~failure-path evidence gaps~~ RESOLVED; ~~tests mostly source-grep~~ RESOLVED — ~68% runtime behavioral; deferred: F5 selection rationale, F7 evidence durability)

### R8. Idempotency, retries, and lock ownership shall be explicit

All ingress, scheduling, execution, integration, and recovery flows **shall** have explicit idempotency behavior, retry policy, lock ownership rules, lease expiry handling, and stale-owner resolution rules. These rules **shall** be enforced in code and documented.

→ **Workstream B: 🟡 Substantially Complete** (~~`patchIssueState` backdoor allows lifecycle bypass~~ RESOLVED via LIFECYCLE_FIELDS guard; remaining: heartbeatLease direct mutation)

### R9. Execution completion and workflow completion shall be distinct

The platform **shall** distinguish clearly between runner completion, integration completion, evidence publication, and workflow closure. No API surface or state transition may imply full workflow completion before integration and evidence closure are actually complete.

→ **Workstreams B + F: 🟡 Substantially Complete** (~~`integration_pending → completed` still allowed without evidence gate~~ RESOLVED — must go through `evidence_pending`; Workstream G must enforce closure gating)

### R10. Evidence shall gate closure

Issue closure and final success status **shall** require defined evidence artifacts for scheduling, execution, validation, integration, and recovery outcomes where applicable. Missing evidence **shall** block closure.

→ **Workstream G: ⬜ Ready to Start** (this is the primary deliverable of G; A–F now sufficient to begin)

### R11. Service lifecycle behavior shall be deliberate

Systemd units, timers, recovery loops, and startup flows **shall** have explicit dependency, overlap, restart, and ownership semantics. Host supervision must support correctness, not only liveness.

→ **Workstream E: 🟡 Substantially Complete** (~~timer/dependency validation is simplistic~~ improved — enforcement-grade timer overlap + dependency chain validation; lifecycle checks remain repo-static)

### R12. Documentation shall describe implemented behavior only

Architecture, operations, recovery, scheduling, state, configuration, and boundary documents **shall** match implemented behavior. Stale, contradictory, or aspirational claims **shall** be removed or explicitly marked as target-state, not current-state.

→ **Workstream H: ⬜ Not Started** (runs continuously)

## Prioritized Workstreams

1. **Workstream A** — Authoritative scheduling and claim control (🟡)
2. **Workstream B** — State model normalization and durable ownership (🟡)
3. **Workstream C** — Recovery demotion to state-only safety behavior (✅)
4. **Workstream D** — Repo/worktree boundary hardening (🟡)
5. **Workstream E** — Configuration and service lifecycle hardening (🟡)
6. **Workstream F** — Provider-routing determinism and context-control evidence (✅)
7. **Workstream G** — Evidence, closure, and observability model (⬜ Ready to Start — carry-forward: A3, E4, F5, F7)
8. **Workstream H** — Documentation and reality-alignment closure (⬜ — continuous)
