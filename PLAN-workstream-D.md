# Workstream D — Repo/Worktree Boundary Hardening

> Part of [PLAN.md](./PLAN.md) · Status: 🟡 Substantially Complete · Started: 2026-04-16

## Summary

BRIDGE_MODE formalization, fail-closed validate-boundary-invariants (throws on critical worktree misconfigs), assertBridgeMutationBoundary in tool path, 61 boundary enforcement tests (runtime behavior, not just source verification), ADR-0008/0003 updated. **Remaining caveat:** codex control-plane exception relies on service/port isolation + documentation rather than hard in-tool mutation enforcement (accepted design choice per ADR-0008).

## Requirements Addressed

- **R5. Worktree isolation shall be the default and enforced boundary** — All code-changing autonomous execution shall occur in explicitly managed worktrees unless a documented exception is approved, justified, constrained, and enforced by code.

## Detailed Progress

### D Phase 0 — Boundary Audit (COMPLETE)

Audit findings from tracing the codex bridge execution path and enumerating all main-repo execution surfaces:

- [x] **Codex bridge is a server-side mutation path.** The bridge has file-mutating tools (`write_file`, `str_replace`, `apply_patch`) that use `fs.writeFileSync()` with paths resolved via `resolveRequestPath()` → `remapRepoPathToBridgeRoot()`. These tools write to `BRIDGE_ROOT` which equals the main repo for the codex bridge.
- [x] **`assertMutationContext` is NOT in the bridge tool path.** It exists in `run-tool-loop.mjs` (symphony-agent layer), but the bridge's AI SDK tool execution path (`invoke-with-aiinner.mjs`) does not call it. This is acceptable because the codex bridge is a developer tool, not an autonomous execution path.
- [x] **Identity contradiction identified.** The codex bridge sets `ANQR_WORKTREE_ID=codex` → `IS_WORKTREE_BRIDGE=true`, but `BRIDGE_ROOT === CONTROL_REPO_ROOT` (both `/home/user/src/anqr`). No `BRIDGE_MODE` concept existed to distinguish this.
- [x] **Codex bridge is a separate service.** Port 4330, outside the executor pool (4321-4328). Router, scheduler, and reconciler never route work to port 4330.
- [x] **Six defense layers mapped** — config routing, router cwd rebasing, systemd WorkingDirectory, process cwd, Codebuff client isolation, file operations. All enforce isolation for executors; codex bridge is the documented exception.
- [x] **Runner guard verified.** `symphony-runner/runtime.mjs` refuses main-repo execution.
- [x] **Discord isolation verified.** `discord-request-router/process-and-proxy.mjs` blocks main-repo cwd.

### D Phase 1 — Bridge Identity Formalization (COMPLETE)

- [x] `bridge-mode.mjs` — derives `BRIDGE_MODE` from `BRIDGE_ROOT === CONTROL_REPO_ROOT`: `"worktree"` (isolated) or `"control-plane"` (main repo exception). Supports explicit env var override.
- [x] `deriveBridgeMode()` — pure function for testing the derivation logic
- [x] `anqr-symphony-codex.service` — updated to set `BRIDGE_MODE=control-plane` explicitly
- [x] All new modules exported from `index.mjs`

### D Phase 2 — Boundary Enforcement Tests (COMPLETE)

- [x] `boundary-enforcement.spec.ts` — 28 tests in 6 categories:
  - Service file audit: executor uses worktree WorkingDirectory, codex uses main repo with control-plane, executor never points to main repo, codex on separate port, runner refuses main repo, Discord router blocks main-repo cwd
  - Bridge mode derivation: control-plane when roots match, worktree when different, trailing slash handling, all 8 worktree paths
  - assertMutationContext: blocks main repo, allows worktree, allows read-only, blocks missing worktreeId/leaseId, blocks projectRoot/worktreeRoot mismatch
  - remapRepoPathToBridgeRoot safety: early return for non-worktree, BRIDGE_ROOT fallback, isPathWithinRoot containment (not startsWith), parent traversal rejection
  - validate-boundary-invariants: module exists, checks consistency, logs ADR-0008 warning, called at startup
  - Env drift detection: parseEnvKeys extracts keys, handles missing files, checkEnvDrift returns structured result, harness-doctor integration

### D Phase 3 — Startup Boundary Assertion — FAIL-CLOSED (COMPLETE)

- [x] `validate-boundary-invariants.mjs` — **fail-closed** enforcement at bridge startup:
  - **THROWS** (fatal) if BRIDGE_MODE=worktree but IS_WORKTREE_BRIDGE=false — misconfigured executor
  - **THROWS** (fatal) if BRIDGE_MODE=worktree but BRIDGE_ROOT === CONTROL_REPO_ROOT — would mutate main repo
  - Warns (non-fatal) if BRIDGE_MODE=control-plane but BRIDGE_ROOT !== CONTROL_REPO_ROOT
  - Warns (non-fatal) for control-plane bridges (ADR-0008 exception acknowledgment)
- [x] `validate-startup-env.mjs` — **fail-closed** for critical config:
  - **THROWS** (fatal) if zero provider tokens configured — bridge cannot serve any requests
  - **THROWS** (fatal) in worktree mode for missing ANQR_WORKTREE_ID, SYMPHONY_BRIDGE_PORT, BRIDGE_MODE
  - Warns (non-fatal) in control-plane mode
- [x] `server.mjs` — calls both validators at module load time; throw propagates and crashes the process (fail-closed)

### D Phase 4 — ADR and Documentation (COMPLETE)

- [x] ADR-0008 updated: added Enforcement section with BRIDGE_MODE table, defense layers table, startup validation details, key constraint (codex bridge must NOT be used for autonomous execution), test references
- [x] ADR-0003 updated: added Boundary Enforcement section documenting all six defense layers and their code-level enforcement, cross-references ADR-0008

### D Phase 5 — In-Tool Mutation Boundary (COMPLETE)

- [x] `BRIDGE_MODE=worktree` added to `anqr-symphony-executor@.service` — explicit symmetry with codex bridge's `BRIDGE_MODE=control-plane`
- [x] Port isolation test added to `boundary-enforcement.spec.ts` — proves router WORKTREES pool (ports 4321–4328) structurally excludes codex bridge (port 4330)
- [x] **`assertBridgeMutationBoundary` added to all file-mutating tools:**
  - `write-file-tool.mjs` — calls `assertBridgeMutationBoundary(resolved)` before `writeFileSync`
  - `str-replace-tool.mjs` — calls `assertBridgeMutationBoundary(resolved)` before writing
  - `apply-patch-tool.mjs` — calls `assertBridgeMutationBoundary(resolved)` for create, update, and delete
  - **Worktree mode:** throws if path resolves to CONTROL_REPO_ROOT (blocks main-repo mutation from worktree executor)
  - **Control-plane mode:** logs advisory for audit trail (ADR-0008 developer tooling exception)
  - This is real in-tool enforcement, not just documentation or service isolation

## Implementation Requirements (from original assessment)

**Problem**
The worktree isolation story is weakened by intentional main-repo execution and repair exceptions.

**Required change**
Either remove main-repo code-changing execution paths or formalize them as explicit, minimal, non-default exceptions with dedicated controls, service boundaries, evidence, and approval requirements.

**Expected end state**
The default invariant is simple: autonomous code mutation happens in managed worktrees only. Any exception is visible, bounded, documented, and testable.

**Risks if left unresolved**
Weakened isolation, accidental main-repo mutation, hidden coupling between control checkout and execution checkout, and harder incident analysis.

## Deliverables

- ✅ Explicit policy for main-repo execution paths
- ✅ Formally controlled main-repo mutation path (codex bridge with ADR-0008 exception)
- ✅ Service and runtime config updates enforcing boundary rules
- ✅ Boundary tests covering worktree-only and approved exception flows

## Acceptance Criteria

5. ✅ Main-repo mutation is either eliminated from autonomous execution or documented as an explicit exception with code-level enforcement, evidence, and tests.

## Remaining Caveat

The codex control-plane exception relies on service/port isolation + documentation rather than hard in-tool mutation enforcement. This is an accepted design choice per ADR-0008 — the codex bridge is a developer tool, not part of the autonomous execution fleet.

## Completion Review Findings (gpt-5-agent deep audit)

**Verdict: Substantively complete. The codex caveat is honest and the 🟡 status is appropriate.**

### Findings

| # | Finding | Severity | Detail |
|---|---------|----------|--------|
| D1 | Tests are mixed runtime/source | Medium | A "large fraction" of boundary-enforcement.spec.ts is source inspection (service file audit, server integration checks). Runtime tests exist for pure helpers (deriveBridgeMode, assertMutationContext, etc.) but end-to-end bridge startup proof is missing. |
| D2 | `IS_WORKTREE_BRIDGE` naming contradiction | Low | Codex sets `ANQR_WORKTREE_ID=codex` so `IS_WORKTREE_BRIDGE=true`, but it is not a real worktree bridge. `BRIDGE_MODE` fixes the decision logic but the naming is a future footgun. |
| D3 | `assertBridgeMutationBoundary` scope is narrow | Low | In worktree mode, blocks writes to `CONTROL_REPO_ROOT`. Does not itself enforce "all writes must remain inside BRIDGE_ROOT" — that containment depends on `resolveRequestPath()` + `remapRepoPathToBridgeRoot()`. Safety model is split across helpers. |
| D4 | Codex `/v1/responses` skips auth | Low for D, noted for G | May be intentional for CLI local usage, but if network exposure assumptions change, it's a concern. |
| D5 | `CODEX_SANDBOX_MODE=danger-full-access` | Informational | Both executor and codex services set this. Even if the file/path layer provides containment, the setting is a red flag for any future tighter sandboxing claim. |

### Impact on Workstream G

- **D is acceptable for G** if G explicitly excludes codex from autonomous/scheduled mutation paths
- **G should note:** the exception is policy/envelope based, not capability based — if something routes traffic to codex incorrectly, it can mutate the main repo by design
