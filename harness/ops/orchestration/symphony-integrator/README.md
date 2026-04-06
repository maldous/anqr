# ANQR Symphony Integrator

## 1. Directory Overview

This directory contains the Symphony Integrator module for the ANQR (Agentic Number Query Runner)
harness. The integrator is responsible for merging completed worktree branches into the main branch
by cherry-picking commits and pushing them to the origin. It operates as a queue-based system that
processes integration candidates, handles conflicts gracefully, and updates Linear issues with
integration status. It currently contains 14 files and 0 subdirectories.

## 2. File Summaries

### Files

- **find-issue-by-identifier.mjs** - Async function that queries Linear for open issues matching the given identifier using the linear-client module.
- **git.mjs** - Git wrapper that executes git commands with the PROJECT_ROOT as working directory, 60s timeout, and sets ANQR_AUTOMATION_PUSH=1 environment variable to allow automated pushes.
- **index.mjs** - Generated facade index that exports all public API members: INTEGRATOR_ID, POLL_INTERVAL_MS, LOCK_TTL_MS, git, integrateCandidate, findIssueByIdentifier, scanForRepairedCandidates, processQueue, showStatus, runDaemon, and mode.
- **integrate-candidate.mjs** - Core integration function that cherry-picks a candidate's commit onto a clean integration branch off main, pushes to origin/main, updates the finalization state to "integrated_main", and marks the Linear issue as done. Handles cherry-pick conflicts by marking the candidate as "integration_failed_repairable" and returning it to the same worktree for repair.
- **integrator-id.mjs** - Exports INTEGRATOR_ID constant formatted as "integrator-{PID}" using process.pid.
- **lock-ttl-ms.mjs** - Exports LOCK_TTL_MS constant set to 10 minutes (10_60_1000 ms).
- **logger.mjs** - Shared logger module that imports createLogger from the lib directory and exports logInfo, logWarn, logError, and logDebug functions.
- **mode.mjs** - Exports mode constant derived from process.argv[2] (command line argument).
- **poll-interval-ms.mjs** - Exports POLL_INTERVAL_MS constant defaulting to 30 seconds, configurable via ANQR_INTEGRATOR_POLL_MS environment variable.
- **process-queue.mjs** - Processes the integration queue by first scanning for repaired candidates, then acquiring a global integration lock, iterating through candidates and integrating each one, and releasing the lock. Returns processed count and reason if locked.
- **run-daemon.mjs** - Runs the integrator in daemon mode, polling the queue at POLL_INTERVAL_MS intervals. Handles SIGTERM and SIGINT for graceful shutdown, releasing the integration lock before exiting.
- **runtime.mjs** - Generated runtime carry-forward that imports mode, processQueue, runDaemon, and showStatus from index.mjs. Executes different logic based on mode: "once" runs processQueue once and exits, "daemon" runs runDaemon continuously, "status" shows status and exits. Defaults to usage error if no valid mode provided.
- **scan-for-repaired-candidates.mjs** - Scans the state store for issues in "integration_pending" state that are no longer in the integration candidates list (repaired by worktree) and re-enqueues them.
- **show-status.mjs** - Displays the current integration queue status including candidate count and each candidate's state, branch, and head SHA.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `runtime.mjs` provides a direct execution
path. The README content below is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/orchestration/symphony-integrator/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
