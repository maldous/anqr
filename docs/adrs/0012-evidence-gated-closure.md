# ADR-0012 Evidence-Gated Closure

- Status: Accepted
- Date: 2026-04-18

## Context

Prior to Workstream G, the integrator's `publishEvidenceAndClose` function posted whatever evidence existed (even null or empty) to Linear and marked the issue Done in a single pass. No validation occurred. Closure succeeded regardless of evidence completeness.

This created several risks:

- Issues could close without proof of validation or integration
- The `/v1/linear/execute` path (A3) silently lost ALL evidence because `createEvidenceRecord` was never called
- Concurrent evidence writes risked last-write-wins data loss due to missing file-level locking
- `loadEvidenceRecord` returned null for both "missing file" and "corrupted JSON", making diagnostic impossible
- No audit capability existed to find issues that closed without complete evidence

ADR-0006 established that every mutating candidate must record validation and integration evidence. This ADR extends that contract to require evidence validation before closure.

## Decision

### Evidence must gate closure

The `evidence_pending → completed` transition requires validated evidence at the `standard` completeness level. Missing evidence blocks closure and defers the issue for retry.

### Four completeness levels

| Level      | Description                                           | Use                         |
| ---------- | ----------------------------------------------------- | --------------------------- |
| `minimal`  | correlationId + execution result + integration result | Operator-override threshold |
| `standard` | minimal + ingress + push + validation (if applicable) | Normal closure threshold    |
| `full`     | standard + providerRouting + providerSelection        | Incident reconstruction     |
| `enriched` | full + contextReduction + safetyNet (conditional)     | Advisory only               |

### Closure gate location

`publishEvidenceAndClose` calls `validateEvidenceCompleteness(correlationId, "standard")` before posting the evidence comment or marking Done. If incomplete:

1. Issue self-transitions to `evidence_pending` with `lastError: "incomplete_evidence"`
2. Missing fields are recorded in `finalization.missingEvidence`
3. `evidenceRetries` counter is incremented
4. Function returns `{ ok: false, reason: "incomplete_evidence" }`

### Operator override after retry exhaustion

After `MAX_EVIDENCE_RETRIES` (3) failed evidence collection attempts, `forceCloseWithIncompleteEvidence` is called automatically. This:

1. Records `evidenceOverride: { forced: true, reason, missingFields }` in the evidence record
2. Posts the evidence comment with a warning banner
3. Marks the issue Done

The override is permanent and auditable — the evidence record retains the override metadata.

### Evidence durability (prerequisite)

G Phase 1 added:

- **File-level advisory locking** (`withEvidenceLock`) using O_EXCL + PID + stale-detection
- **Three-state diagnostics** (`loadEvidenceRecordWithDiagnostics`) distinguishing ok/missing/corrupted
- **Idempotent record creation** (`ensureEvidenceRecord`) for paths that previously lacked `createEvidenceRecord`

### A3 path fix

`executeLinearIssueRequest` now:

- Generates a `correlationId` via `randomUUID()` if not provided in headers
- Calls `ensureEvidenceRecord` before spawning the runner child process
- Always sets `ANQR_CORRELATION_ID` environment variable
- Returns `{ status: "execution_complete" }` (not `"completed"`) to distinguish execution from workflow completion

### Selection rationale (F5)

`selectProvider` accepts an optional `selectionLog` array parameter. When provided, each evaluated provider is logged with `{ name, status, reason }` entries. `recordProviderRoutingEvidence` includes a `selectionRationale` field for the log.

## Consequences

- Issues cannot close without validated evidence at `standard` level
- Permanently missing evidence triggers automatic override after 3 retries
- Evidence overrides are auditable via the `evidenceOverride` field
- The `/v1/linear/execute` API response no longer claims workflow completion
- Provider selection decisions are traceable through the evidence chain
- `findIncompleteEvidence()` enables batch auditing of evidence directory
- Recovery and watchdog evidence systems remain separate (no closure path)
