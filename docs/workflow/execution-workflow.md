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
7. Route true human-only work to `Pending` with unblock steps and test evidence requirements.
8. Route catastrophic AI retry/escalation failures to `Todo` (not `Pending`) so they stay in the AI queue for future retry when model capacity improves.

## Refactor Guardrails

- Prefer very small modules with one clear responsibility; when splitting code, bias toward one AST-heavy construct per file so low-capacity models can reason about the file in isolation.
- Treat "one AST-heavy construct per file" as the default target, not a loose preference. In practice this means one exported component, one exported function, one exported type/interface, or one narrowly scoped constant map per file wherever compatibility allows.
- When a stable import path must remain, prefer turning the old file into a pure re-export barrel and moving the real construct into a dedicated file. A zero-node compatibility barrel is acceptable; a mixed barrel-plus-implementation file is not.
- Run an AST-density audit before and after large refactors. Files that show repeated top-level AST-heavy constructs must be treated as split candidates before the refactor is considered complete.
- Do not re-densify code just to preserve pre-refactor file layouts. Update callers, tests, and docs to the new canonical module paths instead.
- Keep benchmark and profiling suites out of the default correctness gate. `npm run test:unit` is for deterministic unit validation; opt-in profiling belongs in `npm run test:unit:perf`.
- After structural refactors, restore green validation before chasing coverage percentages. Once the default suite is green, run coverage and add focused tests against the new smaller files.
- Use canonical `docs/` updates to record new test entry points, changed module boundaries, and workflow expectations in the same cycle as the code changes.

### AST-Density Audit

Use the parser-backed audit command to identify files that still bundle multiple top-level constructs:

```bash
npm run audit:ast
```

Interpretation notes:

- This audit counts top-level `function`, `class`, `interface`, `type`, `enum`, `module`, and heavy variable declarations such as arrow-function components or large object-literal maps.
- Any file reported by this audit should be reviewed as unfinished structural refactor work.
- High-count UI files, render pipeline files, and state/type hub files should be split first because they create the most reasoning load for low-capacity models.
- Use `npm run audit:ast -- --json` when another tool or agent needs the raw node list.

## Review Readiness

- Acceptance criteria complete.
- Validation commands complete and recorded.
- Evidence comment posted on the Linear issue (commit hash, files changed, validation result).
- `CHANGELOG.md` entry added under today's date.
- PR feedback sweep complete with no outstanding actionable comments.
- Required checks passing.

## Evidence Policy

**Done means proven done.** Every issue moved to Done must have a comment containing verifiable proof of successful completion. This policy exists because audits found issues marked Done with failure evidence, workarounds, dismissive one-liners, or no evidence at all.

### Required Evidence Format

Every Done issue comment must include:

1. **Commit hash(es)** — The specific commits that implement the change.
2. **Files changed** — Which files were modified.
3. **Validation command + output** — The exact command run and its result (exit code, key log lines, pass/fail).
4. **Pass/fail verdict** — An explicit `PASS` or `FAIL` determination.

### Evidence That Does NOT Qualify

| Anti-pattern               | Example                                      | Why it fails                               |
| -------------------------- | -------------------------------------------- | ------------------------------------------ |
| Dismissive one-liner       | "Resolved. Continue"                         | No proof of what was done or that it works |
| Evidence of failure        | "Exit code: 2", "Terminated at 435/1000"     | Proves the task FAILED, not succeeded      |
| Workaround instead of fix  | "Snyk was commented out. Close this ticket." | Disabling a feature ≠ fixing it            |
| Description without output | "Implemented circuit breaker with cooldowns" | Describes intent, not verified result      |
| Unchecked workpad          | Plan items all `[ ]` with "Resolved"         | Plan shows no work was actually completed  |

### Rules

1. **A failed validation cannot be marked Done.** If the evidence comment shows a non-zero exit code, error output, or incomplete execution, the issue must stay in Backlog (or be re-scoped).
2. **A workaround is not a resolution.** If the issue was resolved by disabling/removing the feature, it must be either re-scoped with a new title reflecting the actual decision, or moved to Canceled with documented rationale.
3. **Parent issues cannot be Done with incomplete children.** If any child issue remains in a non-terminal state (Backlog, Todo, In Progress, Pending), the parent stays open. Canceled children with documented rationale do not block the parent.
4. **Evidence must be posted IN the issue**, not just in commit messages or external docs. The Linear issue is the permanent audit trail.
5. **Audits will move issues back.** Any Done issue found lacking evidence during hygiene audits will be moved to Backlog with an explanatory comment.

### Evidence Audit Procedure

During scheduled hygiene passes, for every Done issue:

1. Read all comments for commit hashes, command output, and explicit pass/fail.
2. Verify the evidence shows SUCCESS (not failure, not workaround).
3. If evidence is missing or shows failure → move to Backlog with explanatory comment.
4. If evidence shows a workaround → move to Backlog or recommend Canceled with rationale.

## Ongoing Hygiene

- **Evidence audit**: every Done issue must pass the evidence policy above. Issues failing audit are moved back to Backlog.
- `CHANGELOG.md` must be kept up to date — every resolved issue adds an entry.
- Run scheduled issue hygiene (priority/state/label reconciliation) continuously.
- Keep descriptor prefixes consistent across open work (`[PARENT]`, `[CHILD]`, `[HUMAN]`, `[EMAIL]`, `[CI]`, `[HARNESS]`).
- Ensure every `[CHILD]` issue has a true Linear parent link to a `[PARENT]` issue.
- Ensure all actionable issues have explicit priority (no priority `0` on open work).
- For same-priority issue selection, process oldest issues first (lowest ANQ identifier first).
- Ensure there is always at least one `In Progress` issue aligned with the highest-priority actionable work.
