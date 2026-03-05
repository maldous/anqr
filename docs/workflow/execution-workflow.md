# Execution Workflow

## Baseline

1. Confirm current issue state and route to the matching flow.
2. Use one persistent `## Codex Workpad` comment as the source of truth.
3. Reconcile plan/checklists before implementation.
4. Capture reproduction evidence before editing.

## Implementation Loop

1. Implement against explicit checklist items.
2. Keep workpad checkboxes synced with reality.
3. Run deterministic validation commands for changed scope.
4. Re-run validation before every push.

## Review Readiness

- Acceptance criteria complete.
- Validation commands complete and recorded.
- PR feedback sweep complete with no outstanding actionable comments.
- Required checks passing.
