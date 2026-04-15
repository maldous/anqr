# Symphony Integrator

## Purpose

Single-writer integration service that drains integration candidates, cherry-picks them onto mainline one at a time, and publishes evidence-backed closeout.

## Contents

- 14 immediate files
- 1 child directory

## Key Files

- `find-issue-by-identifier.mjs` - Exports `findIssueByIdentifier`, the main helper defined in this file.
- `git.mjs` - Exports `git`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `integrate-candidate.mjs` - Re-export facade that assembles the public surface for this directory.
- `integrator-id.mjs` - Exports `INTEGRATOR_ID`, a shared constant or state value used by sibling modules.
- `lock-ttl-ms.mjs` - Exports `LOCK_TTL_MS`, a shared constant or state value used by sibling modules.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `mode.mjs` - Exports `mode`, a shared constant or state value used by sibling modules.
- `poll-interval-ms.mjs` - Exports `POLL_INTERVAL_MS`, a shared constant or state value used by sibling modules.
- `process-queue.mjs` - Exports `processQueue`, the main helper defined in this file.
- `run-daemon.mjs` - Exports `runDaemon`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `scan-for-repaired-candidates.mjs` - **Retained no-op.** Exports `scanForRepairedCandidates` which does nothing; integration candidates are now derived from `finalization.state` via `listIntegrationCandidates()` (Phase 5).
- `show-status.mjs` - Exports `showStatus`, the main helper defined in this file.

## Subdirectories

- `integrate-candidate/` - Integrate Candidate scope; immediate files include `build-evidence-comment.mjs`, `index.mjs`, `integrate-candidate.mjs`, `publish-evidence-and-close.mjs`.

## Evidence-Gated Closure (Workstream G)

The integrator enforces **evidence-gated closure** as defined in ADR-0012:

1. After cherry-pick integration, issue transitions to `evidence_pending_closeout`
2. `publishEvidenceAndClose` validates evidence at `standard` completeness level
3. If evidence is incomplete, closure is deferred (issue stays in `evidence_pending`)
4. After 3 failed retries (`MAX_EVIDENCE_RETRIES`), `forceCloseWithIncompleteEvidence` auto-overrides
5. Override records `evidenceOverride` metadata in the evidence record for audit

### Mandatory evidence for closure (`standard` level)

- `correlationId`, `execution.success`, `execution.completedAt`
- `integration.success` (must be `true`), `integration.mainSha`
- `ingress.source`, `ingress.issueIdentifier`
- `push.success` (must be `true`), `push.branch`
- `validation.passed`, `validation.typecheckPassed`, `validation.testsPassed` (conditional: when push exists)

### Files

- `publish-evidence-and-close.mjs` — closure gate with `validateEvidenceCompleteness`
- `force-close-with-incomplete-evidence.mjs` — operator override after retry exhaustion
- `build-evidence-comment.mjs` — formats evidence record into Linear comment

## Operational Notes

- Current on-disk inventory: 15 immediate file(s) and 1 child directory.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus

Check that the current implementation in this directory still matches its intended role in the harness architecture.
