# ANQR Symphony Integrator

## 1. Directory Overview

This directory implements **ANQR Symphony Integrator** within the ANQR harness. The immediate code includes a standalone runtime entry point alongside helper modules. The current inventory is 14 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **find-issue-by-identifier.mjs** - Exports `findIssueByIdentifier`, which finds issue by identifier.
- **git.mjs** - Exports `git`, which implements git.
- **index.mjs** - Facade module that re-exports public members from `./integrator-id.mjs`, `./poll-interval-ms.mjs`, `./lock-ttl-ms.mjs`, `./git.mjs`, `./integrate-candidate.mjs`, `./find-issue-by-identifier.mjs`, and 5 more siblings.
- **integrate-candidate.mjs** - Exports `integrateCandidate`, which implements integrate candidate.
- **integrator-id.mjs** - Exports `INTEGRATOR_ID`, a shared constant used by sibling modules.
- **lock-ttl-ms.mjs** - Exports `LOCK_TTL_MS`, a shared constant used by sibling modules.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **mode.mjs** - Exports `mode`, which implements mode.
- **poll-interval-ms.mjs** - Exports `POLL_INTERVAL_MS`, a shared constant used by sibling modules.
- **process-queue.mjs** - Exports `processQueue`, which implements process queue.
- **run-daemon.mjs** - Exports `runDaemon`, which runs daemon.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **scan-for-repaired-candidates.mjs** - Exports `scanForRepairedCandidates`, which implements scan for repaired candidates.
- **show-status.mjs** - Exports `showStatus`, which shows status.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include subprocess execution, timer, scheduling, cooldown, or watchdog behavior, Linear integration, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/orchestration/symphony-integrator/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`
- **Internal relative modules** - `../../core/worktree-config.mjs`, `../../lib/logger.mjs`, `../../linear-client.mjs`, `../../symphony-state.mjs`, `./find-issue-by-identifier.mjs`, `./git.mjs`, `./index.mjs`, `./integrate-candidate.mjs`, `./integrator-id.mjs`, `./lock-ttl-ms.mjs`, `./logger.mjs`, `./poll-interval-ms.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
