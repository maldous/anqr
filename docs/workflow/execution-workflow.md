# Execution Workflow

## Baseline

1. Confirm current issue state and route to the matching flow.
2. Use one persistent `## Codex Workpad` comment as the source of truth.
3. Reconcile plan/checklists before implementation.
4. Capture reproduction evidence before editing.
5. If new operational knowledge is discovered, update canonical `docs/` in the same cycle.
6. Default to task creation/routing; execute immediately only for urgent operational fixes that should not wait for normal task flow.

## Implementation Loop

1. Implement against explicit checklist items.
2. Keep workpad checkboxes synced with reality.
3. Run deterministic validation commands for changed scope.
4. Re-run validation before every push.
5. Update `CHANGELOG.md` with an entry for this change before committing.
6. Enforce one-task scope; split oversized work into child issues before execution.
7. Route human-only work to `Pending` with unblock steps and test evidence requirements.

## Review Readiness

- Acceptance criteria complete.
- Validation commands complete and recorded.
- Evidence comment posted on the Linear issue (commit hash, files changed, validation result).
- `CHANGELOG.md` entry added under today's date.
- PR feedback sweep complete with no outstanding actionable comments.
- Required checks passing.

## Ongoing Hygiene

- Every resolved issue must have an evidence comment with commit hash, files changed, and validation result.
- `CHANGELOG.md` must be kept up to date — every resolved issue adds an entry.
- Run scheduled issue hygiene (priority/state/label reconciliation) continuously.
- Keep descriptor prefixes consistent across open work (`[PARENT]`, `[CHILD]`, `[HUMAN]`, `[SENTINEL]`).
- Ensure every `[CHILD]` issue has a true Linear parent link to a `[PARENT]` issue.
- Ensure all actionable issues have explicit priority (no priority `0` on open work).
- For same-priority issue selection, process oldest issues first (lowest ANQ identifier first).
- Ensure there is always at least one `In Progress` issue; under two-slot mode keep `[SENTINEL]` plus one top actionable work issue in `In Progress`.
