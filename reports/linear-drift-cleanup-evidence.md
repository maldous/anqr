# Linear Drift Cleanup Evidence

## Summary

Applied the Phase 3.5 live Linear cleanup after the harness state assumptions were brought into line with the canonical ANQR 1.0 workspace model.

## Scope class

- docs-harness

## Touched paths

- `scripts/ops/symphony/WORKFLOW.md`
- `scripts/ops/runtime/symphony/WORKFLOW.md`
- `scripts/ops/integrations/linear/linear-client.mjs`
- `scripts/ops/integrations/sonar/sonar-linear-sync.mjs`
- live Linear workspace (`https://linear.app/anqr`)
- `sonar-report.json`

## Decisions made

- kept `scripts/ops/symphony/WORKFLOW.md` as the live runner prompt, but rewrote it to match current doctrine and repo truth
- downgraded `scripts/ops/runtime/symphony/WORKFLOW.md` to archive-only historical context
- removed non-canonical `Pending` and `Rework` from harness open-state assumptions
- removed the legacy `Duplicate` state constant from the Linear client
- archived the four unused legacy Linear states:
  - `Merging`
  - `Rework`
  - `Pending`
  - `Duplicate`
- retired the zero-usage legacy labels:
  - `paid`
  - `billing`
  - `payment`
  - `p0`
  - `p1`
  - `perf`
  - `security`
  - `analytics`
  - `ads`
  - `api`
  - `ios`
  - `android`
  - `web`
  - `Feature`
  - `Bug`
- remapped all issues out of the two legacy umbrella projects and into canonical stream projects:
  - `ANQR 1.0 Launch`
  - `ANQR Post-Launch`
- deleted the two empty legacy umbrella projects from live Linear:
  - `ANQR 1.0 Launch`
  - `ANQR Post-Launch`
- remapped and retired the still-used legacy labels:
  - `reliability`
  - `Improvement`
- closed the recreated Sonar backlog because those categories must not be tracked in Linear:
  - `too many parameters`
  - `Cognitive Complexity`
  - `top-level await`
- added code-level Sonar sync exclusion so those categories are no longer created in Linear

## Commands run

```bash
npm run cspell
npm run typecheck
npm run harness:quick
npm run sonar:scan
npm run sonar:export
node - <<'NODE'
// Queried live Linear team states, projects, and labels.
NODE
node - <<'NODE'
// Queried live issue usage for legacy states, projects, and labels.
NODE
node - <<'NODE'
// Archived unused legacy states and retired zero-usage legacy labels.
NODE
node - <<'NODE'
// Remapped issues from the two legacy umbrella projects into canonical stream projects.
NODE
node - <<'NODE'
// Closed recreated open [Sonar] issues that should not be tracked in Linear.
NODE
node - <<'NODE'
// Deleted the two now-empty legacy umbrella projects from live Linear.
NODE
```

## Results

- PASS: `npm run cspell`
- PASS: `npm run typecheck`
- PASS: `npm run harness:quick`
- PASS: `npm run sonar:scan`
- PASS: `npm run sonar:export`
- PASS: live Linear query confirmed all four extra legacy states were unused
- PASS: live Linear query confirmed the retired legacy labels were unused
- PASS: live Linear mutations archived the unused legacy states
- PASS: live Linear mutations retired the zero-usage legacy labels
- PASS: live Linear verification confirmed the archived states no longer appear in the team state list
- PASS: live Linear verification confirmed the retired labels now carry `retiredAt` timestamps
- PASS: live Linear remap moved all issues out of `ANQR 1.0 Launch`
- PASS: live Linear remap moved all issues out of `ANQR Post-Launch`
- PASS: live Linear delete removed `ANQR 1.0 Launch`
- PASS: live Linear delete removed `ANQR Post-Launch`
- PASS: `reliability` label usage was remapped and the label was retired
- PASS: `Improvement` label usage was remapped and the label was retired
- PASS: open `[Sonar]` issues are back to `0`
- PASS: Sonar sync now excludes `too many parameters`, `Cognitive Complexity`, and `top-level await`
- INFO: an intermediate fresh Sonar audit recreated current findings before the exclusion rule was tightened; those recreated issues were then closed deliberately

## Changed files

- `scripts/ops/symphony/WORKFLOW.md`
- `scripts/ops/runtime/symphony/WORKFLOW.md`
- `scripts/ops/integrations/linear/linear-client.mjs`
- `scripts/ops/integrations/sonar/sonar-linear-sync.mjs`
- `reports/linear-drift-cleanup-evidence.md`

## Commit hash

- Pending local checkpoint

## Issue comment text

- Phase 3.5 live cleanup applied the current convergence slice. The harness no longer encodes the old `Pending`/`Rework` state model, the stale workflow notes are no longer live doctrine, the four unused legacy states are archived, the legacy labels are retired, the two legacy umbrella projects are removed after issue remap, and the open `[Sonar]` backlog is back to zero with code-level exclusions for `too many parameters`, `Cognitive Complexity`, and `top-level await`.

## Artifacts attached/linked

- `reports/linear-drift-classification.md`
- `reports/linear-drift-cleanup-evidence.md`
- `reports/harness-runtime-surface-classification.md`

## Risk / rollback note

- This slice mutated the live Linear team.
- Git rollback does not undo the archived states or retired labels.
- Git rollback does not undo the project remap or `[Sonar]` issue state changes.
- The Sonar exclusion policy is now encoded in code as well as in operator intent.

## Follow-up work

- rerun Sonar-to-Linear sync only when you intentionally want a fresh non-exempt Linear backlog from the current scan
