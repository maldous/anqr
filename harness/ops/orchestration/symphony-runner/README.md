# ANQR Symphony Runner

## 1. Directory Overview

This directory contains the core execution engine for the ANQR (Agentic Number Query Runner) Symphony orchestration system. The Symphony Runner is responsible for executing issues in git worktrees, managing lease-based concurrency, running the AI agent, handling validation, and managing the complete lifecycle from issue pickup to commit and push. It provides worktree-specific execution context, manages state persistence, and implements retry logic with exponential backoff.

## 2. File Summaries

### Core Execution Files

- **execute-issue.mjs** - The main execution function that orchestrates the complete issue lifecycle. Handles worktree sync, lease acquisition, agent execution via runAgent/continueAgent, validation with fix attempts, git commit, branch push, and Discord notifications. Implements repair candidate detection for validation_failed_repairable, commit_failed_repairable, branch_push_failed_repairable, and integration_failed_repairable states.

- **main.mjs** - Entry point for the runner. Parses CLI arguments (--once, --dry-run, --status, --issue), acquires worktree lock, validates clean working tree, runs preflight checks, recovers stale In Progress issues, feeds queue to target minimum, picks issues (prioritizing sticky repairs), and executes them. Handles graceful shutdown via SIGINT/SIGTERM.

### Worktree and Path Management

- **root.mjs** - Resolves the worktree root directory from ANQR_WORKTREE_PATH env var or via getWorktreePath from worktree-config.mjs, falling back to cwd.

- **worktree-id.mjs** - Exports WORKTREE_ID variable and setWorktreeId function for worktree identification.

- **detect-worktree.mjs** - Auto-detects worktree ID by reading .git file content and extracting worktree name from gitdir reference path (format: anqr-wtN).

- **cwd.mjs** - Exports process.cwd() as constant.

- **git-path.mjs** - Resolves path to .git file/directory relative to cwd.

- **expected-pattern.mjs** - Regex pattern for validating worktree paths (anqr-wt\d+).

- **root-matches-pattern.mjs** - Boolean constant checking if ROOT matches expected pattern.

### State and Lock Management

- **state-dir.mjs** - Runtime state directory path (/run/user/{uid}/symphony-runner).

- **lock-file.mjs** - Path to lock file for preventing concurrent runner execution (state-dir/lock-{WORKTREE_ID}).

- **acquire-lock.mjs** - Acquires worktree lock by writing PID to lock file, cleaning up stale locks from dead processes.

- **release-lock.mjs** - Releases worktree lock by removing lock file if current process owns it.

- **is-process-alive.mjs** - Checks if a process ID is alive using process.kill(pid, 0).

- **sync-fail-count.mjs** - Tracks consecutive sync failure count for threshold-based recovery.

- **sync-fail-count-file.mjs** - Path to persistent sync fail count file.

- **ensure-runtime-state-dir.mjs** - Ensures runtime state directory exists with proper permissions.

### Git Operations

- **git-commit.mjs** - Stages changed files, infers commit scope from file paths, sanitizes commit subject, and creates commit with issue identifier and agent summary in body.

- **git-diff-names.mjs** - Returns list of changed file paths (excluding allowed dirty paths).

- **git-diff-stat.mjs** - Returns git diff --stat output for changed files.

- **git-revert.mjs** - Reverts working tree changes via git reset --hard HEAD and git clean -fd.

- **git-push-worktree-branch.mjs** - Pushes current branch to origin with retry logic (3 attempts). Validates branch matches pattern symphony/wt\d+.

- **get-repo-head-sha.mjs** - Gets the SHA for a given git ref (default HEAD).

- **current-branch-name-for-runner.mjs** - Gets current branch name via git rev-parse --abbrev-ref.

- **get-working-tree-entries.mjs** - Returns git status --porcelain output as entries with status codes, normalized paths, and allowed-dirty flag.

- **get-working-tree-status.mjs** - Returns working tree entries categorized into allowed and blocked lists.

- **log-working-tree-entries.mjs** - Logs working tree entries with status and file path (limited to first 25).

- **is-allowed-dirty-path.mjs** - Checks if file path matches allowed dirty path patterns (runtime-generated files like reports, caches).

- **default-allowed-dirty-path-patterns.mjs** - Regex patterns for allowed dirty paths including reports/rag-index/, reports/symphony/, task_requests/tasks/, etc.

- **parse-allowed-dirty-path-env.mjs** - Parses ANQR_RUNNER_ALLOWED_DIRTY_PATHS env var into array of normalized paths.

- **normalize-repo-path.mjs** - Normalizes file paths to use forward slashes and trim whitespace.

- **write-pre-validation-patch.mjs** - Writes git diff patch to temp file before validation sync.

- **remove-temp-file.mjs** - Removes temporary file, silently ignoring errors.

- **sync-worktree-before-validation.mjs** - Syncs worktree with origin/main using git stash/patch pattern to rebase uncommitted changes onto latest main without merge commits. Handles conflicts by detecting CONFLICT or "patch does not apply" in output.

### Issue Picking and Routing

- **pick-issue.mjs** - Selects issues for execution based on priority, source routing (Discord vs Symphony worktrees), cooldown state, and retry exhaustion. Filters issues that canExecuteIssue and optionally baselineOnly.

- **is-discord-issue.mjs** - Checks if issue source includes "discord" (case-insensitive) for worktree routing.

- **is-baseline-repair-issue.mjs** - Identifies baseline repair issues by checking if title starts with "Harness".

### Provider and Model Configuration

- **get-runner-provider.mjs** - Returns provider configuration for Symphony bridge with model from SYMPHONY_BRIDGE_MODEL env var or "symphony/main", base URL from SYMPHONY_BRIDGE_URL env var, and API key from SYMPHONY_BRIDGE_API_KEY env var or "local-symphony".

- **symphony-bridge-url.mjs** - SYMPHONY_BRIDGE_URL constant (default http://127.0.0.1:4319/v1).

- **symphony-bridge-model.mjs** - SYMPHONY_BRIDGE_MODEL constant from SYMPHONY_RUNNER_MODEL env var or "symphony/main".

### Provider Failure Classification

- **classify-provider-failure.mjs** - Classifies provider failures into categories: local_busy (LOCAL_BUSY), quota (429, rate_limit, RESOURCE_EXHAUSTED, accounts exhausted), provider (LLM call failed, No choices), and other (default).

### Lease Management

- **lease-ttl-ms.mjs** - Lease TTL in milliseconds from ANQR_SYMPHONY_LEASE_MS env var or max(RUNNER_STUCK_THRESHOLD_MS, 20 minutes).

### Preflight Checks

- **maybe-run-preflights.mjs** - Conditionally runs global preflight checks based on cached baseline (head, manifestHash, pass). Skips if baseline unchanged since last run.

### Commit Message Generation

- **scope-rules.mjs** - Rules for inferring commit scope from file paths: domain (src/domain/), platform (src/platform/), ui (src/ui, src/components), application (src/features/), observability (src/infra/logging, monitoring, sentry), harness (scripts/ops/), docs (docs/), ci (.github/, ci/).

- **infer-commit-scope.mjs** - Infers commit scope by counting files matching each scope rule and selecting the most frequent.

- **header-max-length.mjs** - Maximum commit header length (100 characters).

- **sanitize-commit-subject.mjs** - Sanitizes commit subject by trimming, removing trailing periods, and lowercasing first character.

### SonarQube Integration

- **run-sonar-post-commit.mjs** - Runs sonar-scanner after commit, waits 10 seconds, fetches issues/hotspots/duplications, and syncs to Linear.

### Status and Logging

- **show-status.mjs** - Displays runner status including worktree ID, root path, lock status, git clean status, LINEAR_API_KEY presence, and run ID.

- **logger.mjs** - Shared logger using createLogger from lib/logger.mjs, exporting logInfo, logWarn, logError, logDebug.

- **run-id.mjs** - Unique run identifier (run-{timestamp}-{pid}).

### Identification Helpers

- **uid.mjs** - User ID from process.getuid() or default 1000.

- **auto-detected-worktree-id.mjs** - Tracks auto-detected worktree ID separate from env-set WORKTREE_ID.

### Facade Files

- **index.mjs** - Facade exporting all public API members from sibling modules. This directory uses a decomposition pattern where original files have been split into sibling modules for better organization.

- **runtime.mjs** - Runtime carry-forward that performs worktree detection, sets worktree ID from env or auto-detection, creates state directory, loads sync fail count, and calls main(). Used for direct execution or as the entry point when running via the parent directory.

## 3. Overall Directory Function

The Symphony Runner is the execution engine of the ANQR harness. It runs in individual git worktrees (wt1-wt8) and processes Linear issues through the complete lifecycle:

1. **Initialization**: Detects worktree ID, acquires lock, validates clean working tree, runs preflight checks
2. **Recovery**: Clears expired leases, recovers stale In Progress issues to Todo
3. **Queue Management**: Feeds queue to ensure minimum depth (TARGET_MIN)
4. **Issue Selection**: Prioritizes sticky repair candidates, then selects by priority/date with Discord/Symphony worktree routing
5. **Execution**: Syncs worktree with main, acquires lease, runs AI agent via Symphony bridge, handles continuation for active subgoals
6. **Validation**: Runs validation checks (typecheck, lint, tests, etc.), attempts automatic fixes
7. **Finalization**: Commits changes, pushes branch, triggers SonarQube scan, sends Discord notification
8. **Error Handling**: Implements exponential backoff for retries, preserves dirty tree for repair candidates, quarantines repeated failures to Backlog

The runner enforces strict worktree isolation - each worktree handles specific issue sources (Discord issues to Discord worktrees, Symphony issues to Symphony worktrees). It uses lease-based concurrency with heartbeat to detect and recover from stale executions.

## 4. Usage Instructions

### Running the Runner

The runner is executed via the facade in the parent orchestration directory or directly from this directory:

```bash
# Via parent facade (recommended)
node ops/orchestration/symphony-runner.mjs --once

# Direct execution from this directory
node ops/orchestration/symphony-runner/runtime.mjs --once

# Dry run mode (skip actual execution)
node ops/orchestration/symphony-runner.mjs --once --dry-run

# Target specific issue
node ops/orchestration/symphony-runner.mjs --issue ANQ-123

# Show runner status
node ops/orchestration/symphony-runner.mjs --status
```

### Environment Variables

- `ANQR_WORKTREE_ID` - Worktree identifier (wt1-wt8)
- `ANQR_WORKTREE_PATH` - Override worktree root path
- `ANQR_RUNNER_ALLOWED_DIRTY_PATHS` - Comma-separated list of allowed dirty paths
- `ANQR_SYMPHONY_LEASE_MS` - Lease TTL in milliseconds
- `LINEAR_API_KEY` - Required for Linear API access
- `SYMPHONY_BRIDGE_URL` - Bridge endpoint (default http://127.0.0.1:4319/v1)
- `SYMPHONY_BRIDGE_API_KEY` - Bridge API key (default local-symphony)
- `SYMPHONY_RUNNER_MODEL` - Model to use (default symphony/main)
- `SONAR_TOKEN` - For SonarQube post-commit scans
- `SONAR_HOST_URL` - SonarQube host (default http://localhost:9000)

### Worktree Setup

The runner must run in a git worktree, not the main repository. Worktrees are created via:

```bash
git worktree add /path/to/anqr-wt1 -b symphony/wt1
```

## 5. Dependencies

### Internal Dependencies

- **../../symphony-config.mjs** - Configuration constants (TARGET_MIN, RUNNER_MAX_RETRIES, etc.)
- **../../symphony-state.mjs** - Issue state management, lease handling, cooldown tracking
- **../../symphony-queue-control.mjs** - Queue feeding and snapshots
- **../../symphony-validation.mjs** - Validation runner and feedback formatting
- **../../linear-client.mjs** - Linear API client for issue operations
- **../../core/worktree-config.mjs** - Worktree path resolution and Discord/Symphony classification
- **../../integrations/notifications/openclaw-discord.mjs** - Discord notifications
- **../../lib/sonar-linear-sync.mjs** - SonarQube to Linear sync

### External Services

- **Linear** - Issue tracking and state management
- **Symphony Bridge** - AI agent execution via OpenAI-compatible API
- **SonarQube** - Code quality scanning (optional, requires SONAR_TOKEN)
- **Discord** - Completion notifications (optional)

## 6. Additional Comments

- **Worktree Isolation**: Each runner instance runs in a dedicated worktree to enable parallel execution without conflicts. The runner enforces clean working tree before execution (except for repair candidates in dirty_owned state).

- **Lease-Based Concurrency**: Uses leases with heartbeat to track execution progress. If heartbeat fails (lease lost), the runner reverts changes and returns issue to Todo.

- **Repair Candidate Logic**: When validation fails with repairable errors, the runner preserves the dirty tree and assigns the issue back to the same worktree for repair (up to RUNNER_VALIDATION_REPAIR_MAX attempts).

- **Failure Fingerprinting**: Repeated failures with the same signature are quarantined to Backlog to prevent infinite retry loops.

- **Wall-Clock Budget**: RUNNER_MAX_EXECUTION_MS (default 7.2M ms = 2 hours) limits total execution time per issue to prevent runaway jobs.

- **Baseline Caching**: Pre-flight checks are cached by commit hash and validation manifest to skip redundant execution when baseline unchanged.

- **Discord/Symphony Routing**: Discord worktrees (wt5-wt8) handle Discord-sourced issues only; Symphony worktrees (wt1-wt4) handle non-Discord issues. This prevents concurrent conflicts on shared resources.