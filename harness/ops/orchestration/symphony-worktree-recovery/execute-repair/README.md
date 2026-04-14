# Execute Repair

## Purpose
Fleet recovery, quarantine, and health enforcement. All actions emit structured evidence per ADR-0006 and respect the non-publishing constraint of ADR-0005.

### Recovery Action Classification

| Action | Action Class | State-Only | Non-Publishing | Notes |
|---|---|---|---|---|
| skip | skip | ✅ | ✅ | Active/clean — no action needed |
| reclaim_lease | reclaim_lease | ✅ | ✅ | Release stale lease, mark dirty_owned or quarantine |
| continue_repair | continue_repair | ✅ | ✅ | Confirm dirty_owned state for runner repair |
| retry_push | demotion→quarantine | ✅ | ✅ | **Demoted** from push to quarantine (ADR-0005) |
| auto_commit_and_push | demotion→quarantine | ✅ | ✅ | **Demoted** from publish to quarantine (ADR-0005) |
| quarantine | quarantine | ✅ | ✅ | Record quarantine in state |
| reset_to_main | sandbox_reset | ❌ | ✅ | Sandbox maintenance — git fetch/reset/clean (no commit/push) |
| reprovision | reprovision | ✅ | ✅ | Mark for reprovisioning |

## Contents
- 5 immediate files
- 0 child directories

## Key Files
- `build-commit-message.mjs` - Exports `buildCommitMessage`, the main helper defined in this file.
- `execute-repair.mjs` - Exports `executeRepair`, the main helper defined in this file.
- `extract-file-names.mjs` - Exports `extractFileNames`, the main helper defined in this file.
- `format-file-summary.mjs` - Exports `formatFileSummary`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 5 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Verify every action emits evidence, demoted actions never execute git publish commands, `reset_to_main` is guarded against active leases, and the `buildEvidence` function derives `isNonPublishing` from an explicit action class set.
