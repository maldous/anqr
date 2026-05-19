## ANQ-4443: [Sonar] Remove this unused import of 'MIME_TYPES'. (status-server.mjs:16) (2025-01-24)

- Removed unused import of MIME_TYPES from harness/ops/status-server/status-server.mjs.

## ANQ-4412: [Sonar] Unexpected negated condition. (server.mjs:637) (2025-01-24)

- Simplified conditional logic using nullish coalescing operator to eliminate negated condition pattern

## ANQ-4406: [Sonar] Use `for…of` instead of `.forEach(…)`. (app.js:171) (2026-01-16)

- Replaced `.forEach()` with `for...of` loops in status-server app.js for better performance and consistency.

## ANQ-4393: [Sonar] `validIssueIds` should be a `Set`, and use `validIssueIds.has()` to check existence or non-existence. (cleanup-stale-state.ts:21) (2026-01-16)

- Changed `validIssueIds` from array to Set and updated filter to use `.has()` instead of `.includes()` for better performance.

## ANQ-4380: [Sonar] `String.raw` should be used to avoid escaping `\`. (code-search-tool.mjs:9) (2026-01-16)

- Updated code-search-tool.mjs to use String.raw for backslash escape instead of manual escaping.

## ANQ-3654: [Sonar] Either use this collection's contents or remove the collection. (main.mjs:200) (2026-01-16)

- Removed unused `excludeIds` Set collection from symphony-runner main loop.

## ANQ-3650: [Sonar] Add at least one assertion to this test case. (request-rehydration.spec.ts:96) (2026-01-16)

- Added assertion to verify `completeInflightRequest` does not throw and returns expected state for non-existent request.

## ANQ-3649: [Sonar] Add at least one assertion to this test case. (request-rehydration.spec.ts:92) (2026-01-16)

- Added assertion to verify `completeInflightRequest` does not modify state when called with null/empty requestId.

## ANQ-3647: [Sonar] Add at least one assertion to this test case. (session-state-crud.spec.ts:163) (2026-01-16)

- Added assertions to verify `setSessionMessages` does not throw for null/empty sessionId in the "setSessionMessages + getSessionMessages" describe block.

## ANQ-3329: [Sonar] Add at least one assertion to this test case. (active-job-ownership.spec.ts:144) (2026-05-16)

- Added assertions to verify `getAllActiveOwnership` returns empty object in "does nothing for non-existent ownership" tests.

## ANQ-3314: [Sonar] The catch parameter `readErr` should be named `error_`. (load-state.mjs:14) (2026-05-16)

- Renamed catch parameter `readErr` to `error_` in `harness/ops/core/symphony-state/load-state.mjs` per Sonar rule S7718.

## ANQ-3043: Rename catch parameter to error_ (2026-05-16)

- Updated `sync-worktree-before-validation.mjs` to rename catch parameter `rebaseErr` to `error_` per Sonar rule S7718.

## ANQ-3327: [Sonar] Add at least one assertion to this test case. (session-state-crud.spec.ts:163) (2026-05-16)

- Added assertions to verify `getSessionMessages` returns null for null/empty sessionId in the "clearSessionMessages" test.
