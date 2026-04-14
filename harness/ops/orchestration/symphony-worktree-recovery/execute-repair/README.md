# Execute Repair

## Purpose
Concrete recovery action surface that applies quarantine, lease reclamation, reprovision, or guarded sandbox reset decisions to a classified worktree.


<<<<<<< ours — heading `Recovery Action Classification` (T+F, confidence: medium)
// hint: Logic and cosmetic changes overlap. Resolve logic first, then reformat.
=======
### Recovery Action Classification

| Action               | Action Class        | State-Only | Non-Publishing | Notes                                                        |
| -------------------- | ------------------- | ---------- | -------------- | ------------------------------------------------------------ |
| skip                 | skip                | ✅         | ✅             | Active/clean — no action needed                              |
| reclaim_lease        | reclaim_lease       | ✅         | ✅             | Release stale lease, mark dirty_owned or quarantine          |
| continue_repair      | continue_repair     | ✅         | ✅             | Confirm dirty_owned state for runner repair                  |
| retry_push           | demotion→quarantine | ✅         | ✅             | **Demoted** from push to quarantine (ADR-0005)               |
| auto_commit_and_push | demotion→quarantine | ✅         | ✅             | **Demoted** from publish to quarantine (ADR-0005)            |
| quarantine           | quarantine          | ✅         | ✅             | Record quarantine in state                                   |
| reset_to_main        | sandbox_reset       | ❌         | ✅             | Sandbox maintenance — git fetch/reset/clean (no commit/push) |
| reprovision          | reprovision         | ✅         | ✅             | Mark for reprovisioning                                      |

>>>>>>> theirs — heading `Recovery Action Classification` (T+F, confidence: medium)
<<<<<<< ours — heading `Contents` (F, confidence: medium)
// hint: Logic changed on both sides. Requires understanding intent of each change.
## Contents
- 2 immediate files
- 0 child directories

=======
## Contents

- 2 immediate files
- 0 child directories

>>>>>>> theirs — heading `Contents` (F, confidence: medium)
<<<<<<< ours — heading `Key Files` (F, confidence: medium)
// hint: Logic changed on both sides. Requires understanding intent of each change.
## Key Files
- `execute-repair.mjs` - Exports `executeRepair`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.

=======
## Key Files

- `execute-repair.mjs` - Exports `executeRepair`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.

>>>>>>> theirs — heading `Key Files` (F, confidence: medium)
## Subdirectories

- No child directories in this directory.

<<<<<<< ours — heading `Operational Notes` (S+F, confidence: low)
// hint: Structural and logic conflict. Both design and behavior differ.
## Operational Notes
- Current on-disk inventory: 2 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

=======
## Operational Notes

- `build-commit-message.mjs`, `format-file-summary.mjs`, and `extract-file-names.mjs` were deleted — they became dead code when `auto_commit_and_push` was demoted to quarantine (ADR-0005).

>>>>>>> theirs — heading `Operational Notes` (S+F, confidence: low)
## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
