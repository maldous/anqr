## ANQ-3314: [Sonar] The catch parameter `readErr` should be named `error_`. (load-state.mjs:14) (2026-05-16)

- Renamed catch parameter `readErr` to `error_` in `harness/ops/core/symphony-state/load-state.mjs` per Sonar rule S7718.

## ANQ-3043: Rename catch parameter to error_ (2026-05-16)

- Updated `sync-worktree-before-validation.mjs` to rename catch parameter `rebaseErr` to `error_` per Sonar rule S7718.