# Task Evidence

## Purpose

Durable evidence subsystem that records, validates, and gates closure on per-issue execution evidence. Every mutating candidate must have a complete evidence record before it can close. See ADR-0006 (evidence contract) and ADR-0012 (evidence-gated closure).

## Evidence-Gated Closure (ADR-0012)

The integrator's `publishEvidenceAndClose` calls `validateEvidenceCompleteness(correlationId, "standard")` before marking an issue Done. If evidence is incomplete:

1. Issue stays in `evidence_pending` with `lastError: "incomplete_evidence"`
2. Missing fields are recorded in `finalization.missingEvidence`
3. After `MAX_EVIDENCE_RETRIES` (3) failures, `forceCloseWithIncompleteEvidence` auto-overrides with auditable metadata

### Four completeness levels

| Level | Description | Use |
|-------|-------------|-----|
| `minimal` | correlationId + execution + integration result | Operator-override threshold |
| `standard` | minimal + ingress + push + validation | Normal closure threshold |
| `full` | standard + providerRouting + providerSelection | Incident reconstruction |
| `enriched` | full + contextReduction + safetyNet | Advisory only |

## Contents

- 27 immediate files
- 0 child directories

## Key Files

### Core record management
- `create-evidence-record.mjs` — Creates a new evidence record for a correlationId.
- `ensure-evidence-record.mjs` — Idempotent record creation (used by paths that previously lacked `createEvidenceRecord`, including the A3 `/v1/linear/execute` path).
- `load-evidence-record.mjs` — Loads an evidence record by correlationId.
- `load-evidence-record-with-diagnostics.mjs` — Three-state diagnostics: distinguishes ok, missing, and corrupted records.
- `save-evidence.mjs` — Persists evidence record to disk.
- `update-evidence-record.mjs` — Partial-update helper for evidence records.
- `with-evidence-lock.mjs` — File-level advisory locking (O_EXCL + PID + stale-detection) to prevent concurrent write corruption.
- `get-evidence-dir.mjs` — Returns the evidence storage directory path.
- `get-evidence-path.mjs` — Returns the file path for a specific correlationId's evidence.
- `index.mjs` — Re-export facade that assembles the public surface for this directory.

### Evidence recording (per lifecycle stage)
- `record-execution-result.mjs` — Records execution outcome (success, toolCalls, filesChanged, etc.).
- `record-integration-result.mjs` — Records integration outcome (mainSha, cherryPickSuccess, etc.).
- `record-push-result.mjs` — Records push outcome (branch, success, sha).
- `record-validation-result.mjs` — Records validation outcome (typecheck, tests, lint results).
- `record-worktree-selection.mjs` — Records which worktree was assigned.
- `record-routing-decision.mjs` — Records the routing decision chain.
- `record-provider-routing-evidence.mjs` — Records full provider routing evidence including fallback chain, per-attempt timing, and selection rationale (Workstream F).
- `record-provider-selection.mjs` — Records provider selection outcome.
- `record-context-reduction-evidence.mjs` — Records context-reduction evidence (Workstream F Phase 2).
- `record-safety-net-evidence.mjs` — Records safety-net activation evidence (Workstream F Phase 2).

### Validation, audit, and query
- `validate-evidence-completeness.mjs` — Validates evidence at a given completeness level; used by `publishEvidenceAndClose` as the closure gate.
- `mandatory-evidence-fields.mjs` — Defines mandatory field sets per completeness level.
- `audit-evidence-completeness.mjs` — Batch audit of evidence directory for completeness.
- `find-incomplete-evidence.mjs` — Finds issues with incomplete evidence records.
- `query-routing-evidence.mjs` — Post-hoc query for routing evidence (Workstream F Phase 2).

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 27 immediate files and 0 child directories.
- Evidence records are stored as JSON files in the evidence directory, one per correlationId.
- `with-evidence-lock.mjs` prevents concurrent evidence writes from corrupting records.
- The `ensure-evidence-record.mjs` module fixes the A3 path bug where `createEvidenceRecord` was never called, causing ALL evidence to be silently lost.

## Review Focus

Verify that every execution path (scheduler, A3 direct execute, Discord) calls `ensureEvidenceRecord` early enough, and that `validateEvidenceCompleteness` correctly gates closure per ADR-0012.
