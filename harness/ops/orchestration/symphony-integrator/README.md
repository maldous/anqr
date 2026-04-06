# ANQR Symphony Integrator

## 1. Directory Overview

This directory contains the Symphony Integrator module for the ANQR (Agentic Number Query Runner) harness. The integrator is responsible for merging completed worktree branches into the main branch by cherry-picking commits and pushing them to the origin. It operates as a queue-based system that processes integration candidates, handles conflicts gracefully, and updates Linear issues with integration status.

## 2. File Summaries

### Core Integration Logic

- **integrate-candidate.mjs** - Core integration function that cherry-picks a candidate's commit onto a clean integration branch off main, pushes to origin/main, updates the finalization state to "integrated_main", and marks the Linear issue as done. Handles cherry-pick conflicts by marking the candidate as "integration_failed_repairable" and returning it to the same worktree for repair.

- **process-queue.mjs** - Processes the integration queue by first scanning for repaired candidates, then acquiring a global integration lock, iterating through candidates and integrating each one, and releasing the lock. Returns processed count and reason if locked.

- **scan-for-repaired-candidates.mjs** - Scans the state store for issues in "integration_pending" state that are no longer in the integration candidates list (repaired by worktree) and re-enqueues them.

### Git Operations

- **git.mjs** - Git wrapper that executes git commands with the PROJECT_ROOT as working directory, 60s timeout, and sets ANQR_AUTOMATION_PUSH=1 environment variable to allow automated pushes.

### Linear Integration

- **find-issue-by-identifier.mjs** - Async function that queries Linear for open issues matching the given identifier using the linear-client module.

### Status and Logging

- **show-status.mjs** - Displays the current integration queue status including candidate count and each candidate's state, branch, and head SHA.

- **logger.mjs** - Shared logger module that imports createLogger from the lib directory and exports logInfo, logWarn, logError, and logDebug functions.

### Daemon and Entry Points

- **run-daemon.mjs** - Runs the integrator in daemon mode, polling the queue at POLL_INTERVAL_MS intervals. Handles SIGTERM and SIGINT for graceful shutdown, releasing the integration lock before exiting.

- **runtime.mjs** - Generated runtime carry-forward that imports mode, processQueue, runDaemon, and showStatus from index.mjs. Executes different logic based on mode: "once" runs processQueue once and exits, "daemon" runs runDaemon continuously, "status" shows status and exits. Defaults to usage error if no valid mode provided.

- **index.mjs** - Generated facade index that exports all public API members: INTEGRATOR_ID, POLL_INTERVAL_MS, LOCK_TTL_MS, git, integrateCandidate, findIssueByIdentifier, scanForRepairedCandidates, processQueue, showStatus, runDaemon, and mode.

### Constants and Configuration

- **integrator-id.mjs** - Exports INTEGRATOR_ID constant formatted as "integrator-{PID}" using process.pid.

- **mode.mjs** - Exports mode constant derived from process.argv[2] (command line argument).

- **lock-ttl-ms.mjs** - Exports LOCK_TTL_MS constant set to 10 minutes (10_60_1000 ms).

- **poll-interval-ms.mjs** - Exports POLL_INTERVAL_MS constant defaulting to 30 seconds, configurable via ANQR_INTEGRATOR_POLL_MS environment variable.

## 3. Overall Directory Function

This directory serves as the integration layer for the ANQR harness, responsible for merging completed worktree branches into the main branch. The workflow begins when a worktree completes an issue and marks it as "integration_pending" in the finalization state.

The integration process:
1. **Queue Processing**: The processQueue function scans for repaired candidates, then processes each integration candidate in order.
2. **Lock Acquisition**: Before processing, a global integration lock is acquired with a 10-minute TTL to prevent concurrent integrations.
3. **Cherry-pick Integration**: Each candidate's commit is cherry-picked onto a fresh branch created from origin/main.
4. **Conflict Handling**: If cherry-pick fails (conflict), the candidate is marked "integration_failed_repairable" and returned to the worktree for manual repair. On next scan, repaired candidates are re-enqueued.
5. **Push to Main**: Successful cherry-picks are pushed to origin/main.
6. **Linear Update**: The associated Linear issue is moved to "Done" state and a comment is added with the integration commit SHA.

The integrator can run in three modes:
- **once**: Process queue one time and exit
- **daemon**: Continuously poll and process the queue
- **status**: Display current queue status

## 4. Usage Instructions

### Running the Integrator

```bash
# Run once (process queue and exit)
node ops/orchestration/symphony-integrator/runtime.mjs once

# Run in daemon mode (continuous polling)
node ops/orchestration/symphony-integrator/runtime.mjs daemon

# Show queue status
node ops/orchestration/symphony-integrator/runtime.mjs status
```

### Environment Variables

- **ANQR_INTEGRATOR_POLL_MS** - Poll interval in milliseconds (default: 30000ms = 30s)

### Operational Notes

- The integrator requires write access to the git repository and push permissions to origin
- A global lock prevents concurrent integration runs across multiple processes
- Conflicts are handled gracefully by returning failed candidates to worktrees for repair
- The integrator updates Linear issues automatically with integration status comments

## 5. Dependencies

### Internal Dependencies

- **../../symphony-state.mjs** - For listing integration candidates, acquiring/releasing locks, getting/setting finalization state, and managing issue state
- **../../linear-client.mjs** - For updating Linear issues and adding comments (uses STATES for state transitions)
- **../../core/worktree-config.mjs** - For PROJECT_ROOT constant
- **../../lib/logger.mjs** - For createLogger function

### External Services

- **Git** - Local git repository with remote named "origin"
- **Linear** - Issue tracking platform for updating issue states and adding comments

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Git CLI available in PATH
- Write access to the repository
- Linear API credentials configured

## 6. Additional Comments

- **Fail-Soft Design**: The integrator handles conflicts gracefully by marking candidates as repairable rather than failing permanently. This allows worktrees to fix conflicts and have their candidates re-enqueued automatically.

- **Lock Mechanism**: A global integration lock with 10-minute TTL prevents concurrent integration runs. If another integrator holds the lock, subsequent runs will skip the cycle and retry on the next poll.

- **Repair Cycle**: Candidates that fail due to conflicts enter "integration_failed_repairable" state. Once the worktree repairs the conflict and updates the state back to "integration_pending", the scanForRepairedCandidates function will automatically re-enqueue them.

- **Audit Trail**: All integration actions are logged and Linear issues receive comments documenting the integration result (success with commit SHA or failure with error details).

- **Idempotent Design**: The integrator is designed to be safe to run repeatedly - running "once" multiple times is safe as it only processes candidates that remain in the queue.