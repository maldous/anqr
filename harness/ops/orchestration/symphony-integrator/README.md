# Symphony Integrator

## Purpose
Single-writer integration service that drains queued worktree candidates, admits them into the mainline repository, and publishes evidence back to the issue system.

## Contents
- 14 immediate files
- 1 child directory

## Key Files
- `find-issue-by-identifier.mjs` - Exports `findIssueByIdentifier`, the main helper defined in this file.
- `git.mjs` - Exports `git`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `integrate-candidate.mjs` - Re-export facade that assembles the public surface for this directory.
- `integrator-id.mjs` - Exports `INTEGRATOR_ID`, a shared constant or state value used by sibling modules.
- `lock-ttl-ms.mjs` - Exports `LOCK_TTL_MS`, a shared constant or state value used by sibling modules.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `mode.mjs` - Exports `mode`, a shared constant or state value used by sibling modules.
- `poll-interval-ms.mjs` - Exports `POLL_INTERVAL_MS`, a shared constant or state value used by sibling modules.
- `process-queue.mjs` - Exports `processQueue`, the main helper defined in this file.
- `run-daemon.mjs` - Exports `runDaemon`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `scan-for-repaired-candidates.mjs` - Exports `scanForRepairedCandidates`, the main helper defined in this file.
- `show-status.mjs` - Exports `showStatus`, the main helper defined in this file.

## Subdirectories
- `integrate-candidate/` - Directory for serial integration back into the main repository; immediate files include `build-evidence-comment.mjs`, `index.mjs`, `integrate-candidate.mjs`, `publish-evidence-and-close.mjs`.

## Operational Notes
- This directory is the enforcement point for serial repository integration after concurrent worktree execution.
- Its logic is critical to the stated design principle that one repository may execute many jobs concurrently but integrate one candidate at a time.

## Review Focus
Validate single-writer guarantees, queue handling, evidence publication, repaired-candidate scanning, and whether integration remains the only path back to `main`.
