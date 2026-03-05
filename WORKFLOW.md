# ANQ Codex Workflow Contract

_Last updated: 2026-03-05 (ANQ-39)_

## 1. Linear State Routing Contract

| Linear state | Queue classification | Required automation behavior |
| --- | --- | --- |
| `Backlog` | parked | Do not execute; wait for explicit move to `Todo`. |
| `Todo` | active queue | On pickup, immediately transition to `In Progress` before implementation work. |
| `In Progress` | active queue | Execute implementation, keep one persistent `## Codex Workpad` comment current, and validate continuously. |
| `In Review` | waiting | No implementation while waiting; poll for feedback/decision updates. |
| `Human Review` | waiting | Same handling as `In Review`; wait only. |
| `Rework` | active queue | Re-enter implementation flow with refreshed plan/checklist and address actionable feedback. |
| `Merging` | landing queue | Run land-loop merge flow, then move issue to `Done` when merge completes. |
| `Done` | terminal | No further execution. |

Routing conventions:
- `Todo` and `In Progress` are active execution states.
- `In Review` and `Human Review` are wait states.
- Any actionable reviewer comment on an issue or PR triggers transition to `Rework`.

## 2. Active Project Queue Policy (Audit: 2026-03-05)

Active project definition used for this audit: a project with at least one issue in `Todo` or `In Progress`.

| Project | Active signal | Queue owner | Required issue hygiene | Audit result |
| --- | --- | --- | --- | --- |
| [Symphony](https://linear.app/anqr/project/symphony-c7a7906a4fa6) | `ANQ-39`, `ANQ-20`, `ANQ-7` in active states | Codex | Exactly one priority label (`p0` or `p1`), at least one scope/risk label (`web`/`api`/`ios`/`android`/`analytics`/`ads`/`reliability`/`security`/`perf`), explicit assignee for active states | Gap found: `ANQ-23` missing label/owner hygiene. Follow-up created: [ANQ-40](https://linear.app/anqr/issue/ANQ-40/backfill-symphony-issue-hygiene-labels-and-ownership-defaults). |
| [iOS Release](https://linear.app/anqr/project/ios-release-3a3c843cf3b4) | `ANQ-38`, `ANQ-37`, `ANQ-36` in `Todo` | Codex | Exactly one priority label plus `ios` scope label, explicit assignee for active states | No missing label/ownership gaps found in active queue snapshot. |

Queue execution policy (all active projects):
- Pull from `Todo` by severity first (`p0` before `p1`), then FIFO by oldest update.
- Keep WIP limited to one `In Progress` issue per assignee unless incident work preempts.
- If an issue in `In Progress` has no workpad update for one business day, perform a queue sweep check and either refresh execution notes or move to `Rework` with blocker context.

## 3. Codex Queue Sweep Cadence

### Daily sweep (business days)

1. Review active issues in each active project queue (`Todo`, `In Progress`, `Rework`).
2. Enforce routing contract: waiting items must be in `In Review`/`Human Review`; actionable feedback moves items to `Rework`.
3. Enforce hygiene: ensure active issues have required labels and explicit ownership.
4. Update each active issue's `## Codex Workpad` with current status and evidence.

### Weekly sweep (start of week)

1. Re-audit which projects are currently active based on queue states.
2. Check for missing labels/ownership/routing hygiene across active projects.
3. File Backlog follow-up issues for any discovered hygiene gaps and link them as related dependencies.
4. Confirm this `WORKFLOW.md` contract still matches current ANQ Linear states and update if states changed.

Reference links:
- Symphony queue surface: https://linear.app/anqr/project/symphony-c7a7906a4fa6
- iOS Release queue surface: https://linear.app/anqr/project/ios-release-3a3c843cf3b4
- Current hygiene follow-up from this audit: https://linear.app/anqr/issue/ANQ-40/backfill-symphony-issue-hygiene-labels-and-ownership-defaults
