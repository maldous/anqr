# Linear Board Hygiene

The Linear board is the single source of truth for project execution state. Board drift — stale states, missing prefixes, misclassified issues — degrades agent effectiveness and operator trust. This document defines the invariants, audit procedures, and corrective actions that keep the board accurate.

## Invariants

### Single In Progress Issue

Exactly **one** issue may be `In Progress` at any time. This is the issue currently being executed by an agent or operator.

- Before starting work on a new issue, move it to `In Progress` and move the previous issue out.
- If an agent stalls or crashes, the guardian should detect the orphaned `In Progress` issue and move it back to `Todo` or `Backlog`.
- Multiple `In Progress` issues indicate a board hygiene failure — audit and correct immediately.

### Descriptor Prefix Consistency

Every open issue must carry exactly one primary descriptor prefix:

| Prefix      | Meaning                                         | State Constraint             |
| ----------- | ----------------------------------------------- | ---------------------------- |
| `[PARENT]`  | Umbrella issue with child decomposition         | Backlog until children close |
| `[CHILD]`   | Atomic work item linked to a `[PARENT]`         | Any active state             |
| `[HUMAN]`   | Requires human portal/console/legal access      | Pending (always)             |
| `[EMAIL]`   | Created from inbound email                      | Backlog or Todo              |
| `[CI]`      | Created by CI failure monitor                   | Auto-managed                 |
| `[HARNESS]` | Created by harness report failure               | Auto-managed                 |

Combinations are allowed where meaningful: `[HUMAN] [CHILD]` indicates a child issue that requires human action.

### [HUMAN] Classification Rules

An issue MUST have the `[HUMAN]` prefix if it requires **any** of:

- External portal or console access (AdMob, Play Console, App Store Connect, Firebase, Search Console, Cloudflare, Netlify dashboard, AdSense, etc.)
- Legal, compliance, or privacy policy decisions
- Physical device access not available to agents
- Account creation, credential rotation, or billing changes
- Business go/no-go decisions (launch gates, pricing, SLA terms)

An issue MUST NOT have the `[HUMAN]` prefix if it can be completed entirely through:

- Code changes, configuration edits, or documentation updates
- CLI commands, API calls, or script execution
- Automated test creation or validation
- AI-assisted analysis or report generation

**Audit rule:** Every `Pending` issue must either have `[HUMAN]` prefix or a documented reason why it is blocked. Automated tasks sitting in `Pending` are a board hygiene violation.

### Pending = Human-Blocked Only

`Pending` state is reserved for issues that cannot proceed without human intervention:

- Issues requiring external portal access → `[HUMAN]` prefix + `Pending`
- Issues awaiting human business decisions → `[HUMAN]` prefix + `Pending`
- Issues blocked on external dependencies (not human) → `Backlog` with blocker comment

Automated or AI-doable tasks must **never** sit in `Pending`. Move them to `Backlog` or `Todo`.

### State Machine

```
Backlog → Todo → In Progress → Done
                      ↓
                   Pending (human-blocked only)
                      ↓
                   Backlog (when unblocked)
```

| State       | Meaning                                        | Who acts            |
| ----------- | ---------------------------------------------- | ------------------- |
| Backlog     | Known work, not yet prioritized for execution  | Nobody (queued)     |
| Todo        | Prioritized, ready for next agent cycle        | Agent picks up next |
| In Progress | Actively being worked (exactly one at a time)  | Current agent       |
| Pending     | Blocked on human action                        | Human operator      |
| Done        | Completed with evidence                        | Nobody (terminal)   |
| Canceled    | Intentionally abandoned with rationale         | Nobody (terminal)   |

### Priority Must Be Explicit

Every actionable (non-terminal) issue must have an explicit priority (1–4). Priority 0 on open work is a hygiene violation.

## Git-to-Linear Reconciliation

Commit messages referencing issue identifiers (e.g., `fix(sonar): resolve S3776 (ANQ-269)`) are evidence of work. During board audits:

1. **Scan recent commits** for `ANQ-\d+` references.
2. **Cross-reference** with issue states — if a commit closes the scope of an issue still in Backlog/Todo/In Progress, move it to Done with evidence.
3. **Post evidence comments** on the Linear issue with commit hash, files changed, and validation result.
4. **Partial completion** — if commits address part of an issue (e.g., 10 of 182 findings), note progress but do not mark Done.

```bash
# Find recent commits referencing Linear issues
git log --oneline -40 | grep -i 'ANQ-'
```

## Comment Hygiene

Issue comments accumulate error traces, retry logs, and stale workpads over time. During audits:

- **Delete** error stack traces and retry failure logs that provide no diagnostic value.
- **Preserve** evidence comments (commit hashes, validation output, pass/fail verdicts).
- **Preserve** `AI Hint:` comments that course-correct agents.
- **Consolidate** fragmented workpads into a single `## Codex Workpad` comment.
- **Flag** issues with >10 comments for manual review — high comment count often indicates an issue that is too complex or needs re-scoping.

**Tooling:** Use `scripts/ops/linear-cleanup-comments.mjs` to list and delete noise comments. Dry-run by default; use `--apply` to delete.

```bash
# List noise comments on a single issue (dry-run)
node scripts/ops/linear-cleanup-comments.mjs --issue ANQ-106

# Delete noise comments on a single issue
node scripts/ops/linear-cleanup-comments.mjs --issue ANQ-106 --apply

# Scan all open issues for noise comments older than 7 days
node scripts/ops/linear-cleanup-comments.mjs --all-open --older-than 7

# Delete noise comments across all open issues
node scripts/ops/linear-cleanup-comments.mjs --all-open --apply
```

## Audit Procedure

### Automated Guardian Enforcement

The guardian (`scripts/ops/linear-guardian.mjs`) automatically detects and corrects three critical invariant violations every 5 minutes:

1. **Multiple In Progress** — queries all In Progress issues across the team. If more than one exists, keeps the issue associated with a live Symphony session (or highest priority), and demotes all others to Backlog with an explanatory comment.
2. **Stale In Progress** — for each In Progress issue not associated with a live Symphony session, checks `git log` for commits referencing the issue identifier within the last 48 hours (configurable via `GUARDIAN_STALE_IN_PROGRESS_HOURS`). Issues with no recent commits are moved to Backlog with a staleness comment.
3. **Pending without [HUMAN]** — queries all Pending issues. Any issue without the `[HUMAN]` prefix is moved to Backlog with a comment explaining the Pending reservation rule.

All checks follow the guardian's dry-run/apply convention:
- Without `--apply`: violations are detected and logged but not corrected.
- With `--apply`: violations are auto-corrected and a notification email is sent.

The results appear in the guardian's JSON report under `summary.boardHygiene`:

```json
{
  "boardHygiene": {
    "checked": true,
    "multipleInProgress": { "count": 1, "issues": [...], "demoted": [] },
    "staleInProgress": { "count": 0, "issues": [], "demoted": [] },
    "pendingWithoutHuman": { "count": 0, "issues": [], "corrected": [] }
  }
}
```

The automated checks do **not** replace the full manual audit checklist below — they cover the three highest-impact invariants. The remaining checks (git reconciliation, orphaned children, etc.) still require periodic manual or scripted review.

### Scheduled Cadence

The guardian enforces the three critical invariants (In Progress count, stale In Progress, Pending prefix) automatically every 5 minutes. Full board audits covering all 10 checklist items should occur at minimum **weekly**, ideally as part of the nightly ops pass.

### Audit Checklist

1. **In Progress count** — must be exactly 1. Move extras to Backlog with comment.
2. **Pending without [HUMAN]** — every Pending issue must have `[HUMAN]` prefix or documented block reason. Move automated tasks to Backlog.
3. **[HUMAN] on non-human issues** — remove prefix from issues that can be AI-completed.
4. **Missing [HUMAN] on human issues** — add prefix to issues requiring portal/console/legal access.
5. **Git reconciliation** — scan last 40 commits for issue references; update states where evidence shows completion.
6. **Stale In Progress** — issues In Progress with no commits in >48 hours should be moved to Backlog. *(Automated by guardian)*
7. **Priority gaps** — every non-terminal issue must have priority 1–4.
8. **Orphaned children** — every `[CHILD]` issue must have a Linear parent link (not just title prefix).
9. **Done without evidence** — spot-check recent Done issues for evidence policy compliance (see [Evidence Policy](../workflow/execution-workflow.md#evidence-policy)).
10. **Comment cleanup** — flag issues with excessive error/retry comments for cleanup.

### Audit Commands

```bash
# List In Progress issues (should be exactly 1)
node scripts/ops/linear-list-issues.mjs --state 'In Progress' --format table

# List Pending issues (all should have [HUMAN] or documented block)
node scripts/ops/linear-list-issues.mjs --state 'Pending' --format table

# List all open issues
node scripts/ops/linear-list-issues.mjs --open --format table

# Check git for issue references
git log --oneline -40 | grep -i 'ANQ-'

# Move an issue to a state
node scripts/ops/linear-update-state.mjs --issue ANQ-XXX --state Backlog

# Update an issue title (e.g., add [HUMAN] prefix)
node scripts/ops/linear-update-issue.mjs --issue ANQ-XXX --title '[HUMAN] [CHILD] New title'

# Post an audit comment
node scripts/ops/linear-comment.mjs --issue ANQ-XXX --body 'Board hygiene audit: ...'

# List noise comments on an issue (dry-run)
node scripts/ops/linear-cleanup-comments.mjs --issue ANQ-XXX

# Delete noise comments (requires --apply)
node scripts/ops/linear-cleanup-comments.mjs --issue ANQ-XXX --apply

# Scan all open issues for noise
node scripts/ops/linear-cleanup-comments.mjs --all-open --older-than 7
```

## Common Violations and Corrections

| Violation                               | Correction                                              |
| --------------------------------------- | ------------------------------------------------------- |
| Multiple issues In Progress             | Move extras to Backlog with audit comment                |
| Automated task in Pending               | Move to Backlog                                         |
| Human-dependent issue missing [HUMAN]   | Add prefix, ensure in Pending with unblock steps        |
| [HUMAN] on AI-doable issue              | Remove prefix, move to Backlog or Todo                  |
| Done issue with no evidence             | Move to Backlog with comment requesting evidence        |
| Commit closes issue still in Backlog    | Move to Done, post evidence comment with commit hash    |
| [CHILD] without Linear parent link      | Link to parent via Linear UI or API                     |
| Stale In Progress (no activity >48h)    | Move to Backlog with staleness comment                  |
| Issue with >10 error/retry comments     | Clean comments, consider re-scoping the issue           |

## Relationship to Other Docs

- **Evidence Policy:** [`docs/workflow/execution-workflow.md` §Evidence Policy](../workflow/execution-workflow.md#evidence-policy) — what constitutes valid Done evidence.
- **Operational Invariants:** [`docs/harness/agent-first.md` §Operational Invariants](agent-first.md#operational-invariants) — foundational rules this document enforces.
- **Autonomous Framework:** [`docs/harness/autonomous-framework.md`](autonomous-framework.md) — guardian and harness checks that automate parts of board hygiene.
- **Ops Autopilot:** [`docs/operations/ops-autopilot.md`](../operations/ops-autopilot.md) — guardian timer that enforces labels and state every 5 minutes.
