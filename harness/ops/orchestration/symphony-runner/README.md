# ANQR Symphony Runner

## 1. Directory Overview

This directory contains the core execution engine for the ANQR (Agentic Number Query Runner)
Symphony orchestration system. The Symphony Runner is responsible for executing issues in git
worktrees, managing lease-based concurrency, running the AI agent, handling validation, and managing
the complete lifecycle from issue pickup to commit and push. It provides worktree-specific execution
context, manages state persistence, and implements retry logic with exponential backoff. It
currently contains 57 files and 0 subdirectories.

## 2. File Summaries

### Files

- **acquire-lock.mjs** - Acquires worktree lock by writing PID to lock file, cleaning up stale locks from dead processes.
- **auto-detected-worktree-id.mjs** - Tracks auto-detected worktree ID separate from env-set WORKTREE_ID.
- **classify-provider-failure.mjs** - Classifies provider failures into categories: local_busy (LOCAL_BUSY), quota (429, rate_limit, RESOURCE_EXHAUSTED, accounts exhausted), provider (LLM call failed, No choices), and other (default).
- **current-branch-name-for-runner.mjs** - Gets current branch name via git rev-parse --abbrev-ref.
- **cwd.mjs** - Exports process.cwd() as constant.
- **default-allowed-dirty-path-patterns.mjs** - Regex patterns for allowed dirty paths including reports/rag-index/, reports/symphony/, task_requests/tasks/, etc.
- **detect-worktree.mjs** - Auto-detects worktree ID by reading .git file content and extracting worktree name from gitdir reference path (format: anqr-wtN).
- **ensure-runtime-state-dir.mjs** - Ensures runtime state directory exists with proper permissions.
- **execute-issue.mjs** - The main execution function that orchestrates the complete issue lifecycle. Handles worktree sync, lease acquisition, agent execution via runAgent/continueAgent, validation with fix attempts, git commit, branch push, and Discord notifications. Implements repair candidate detection for validation_failed_repairable, commit_failed_repairable, branch_push_failed_repairable, and integration_failed_repairable states.
- **expected-pattern.mjs** - Regex pattern for validating worktree paths (anqr-wt\d+).
- **get-repo-head-sha.mjs** - Gets the SHA for a given git ref (default HEAD).
- **get-runner-provider.mjs** - Returns provider configuration for Symphony bridge with model from SYMPHONY_BRIDGE_MODEL env var or "symphony/main", base URL from SYMPHONY_BRIDGE_URL env var, and API key from SYMPHONY_BRIDGE_API_KEY env var or "local-symphony".
- **get-working-tree-entries.mjs** - Returns git status --porcelain output as entries with status codes, normalized paths, and allowed-dirty flag.
- **get-working-tree-status.mjs** - Returns working tree entries categorized into allowed and blocked lists.
- **git-commit.mjs** - Stages changed files, infers commit scope from file paths, sanitizes commit subject, and creates commit with issue identifier and agent summary in body.
- **git-diff-names.mjs** - Returns list of changed file paths (excluding allowed dirty paths).
- **git-diff-stat.mjs** - Returns git diff --stat output for changed files.
- **git-path.mjs** - Resolves path to .git file/directory relative to cwd.
- **git-push-worktree-branch.mjs** - Pushes current branch to origin with retry logic (3 attempts). Validates branch matches pattern symphony/wt\d+.
- **git-revert.mjs** - Reverts working tree changes via git reset --hard HEAD and git clean -fd.
- **header-max-length.mjs** - Maximum commit header length (100 characters).
- **index.mjs** - Facade exporting all public API members from sibling modules. This directory uses a decomposition pattern where original files have been split into sibling modules for better organization.
- **infer-commit-scope.mjs** - Infers commit scope by counting files matching each scope rule and selecting the most frequent.
- **is-allowed-dirty-path.mjs** - Checks if file path matches allowed dirty path patterns (runtime-generated files like reports, caches).
- **is-baseline-repair-issue.mjs** - Identifies baseline repair issues by checking if title starts with "Harness".
- **is-discord-issue.mjs** - Checks if issue source includes "discord" (case-insensitive) for worktree routing.
- **is-process-alive.mjs** - Checks if a process ID is alive using process.kill(pid, 0).
- **lease-ttl-ms.mjs** - Lease TTL in milliseconds from ANQR_SYMPHONY_LEASE_MS env var or max(RUNNER_STUCK_THRESHOLD_MS, 20 minutes).
- **lock-file.mjs** - Path to lock file for preventing concurrent runner execution (state-dir/lock-{WORKTREE_ID}).
- **log-working-tree-entries.mjs** - Logs working tree entries with status and file path (limited to first 25).
- **logger.mjs** - Shared logger using createLogger from lib/logger.mjs, exporting logInfo, logWarn, logError, logDebug.
- **main.mjs** - Entry point for the runner. Parses CLI arguments (--once, --dry-run, --status, --issue), acquires worktree lock, validates clean working tree, runs preflight checks, recovers stale In Progress issues, feeds queue to target minimum, picks issues (prioritizing sticky repairs), and executes them. Handles graceful shutdown via SIGINT/SIGTERM.
- **maybe-run-preflights.mjs** - Conditionally runs global preflight checks based on cached baseline (head, manifestHash, pass). Skips if baseline unchanged since last run.
- **normalize-repo-path.mjs** - Normalizes file paths to use forward slashes and trim whitespace.
- **parse-allowed-dirty-path-env.mjs** - Parses ANQR_RUNNER_ALLOWED_DIRTY_PATHS env var into array of normalized paths.
- **pick-issue.mjs** - Selects issues for execution based on priority, source routing (Discord vs Symphony worktrees), cooldown state, and retry exhaustion. Filters issues that canExecuteIssue and optionally baselineOnly.
- **release-lock.mjs** - Releases worktree lock by removing lock file if current process owns it.
- **remove-temp-file.mjs** - Removes temporary file, silently ignoring errors.
- **root-matches-pattern.mjs** - Boolean constant checking if ROOT matches expected pattern.
- **root.mjs** - Resolves the worktree root directory from ANQR_WORKTREE_PATH env var or via getWorktreePath from worktree-config.mjs, falling back to cwd.
- **run-id.mjs** - Unique run identifier (run-{timestamp}-{pid}).
- **run-sonar-post-commit.mjs** - Runs sonar-scanner after commit, waits 10 seconds, fetches issues/hotspots/duplications, and syncs to Linear.
- **runtime.mjs** - Runtime carry-forward that performs worktree detection, sets worktree ID from env or auto-detection, creates state directory, loads sync fail count, and calls main(). Used for direct execution or as the entry point when running via the parent directory.
- **sanitize-commit-subject.mjs** - Sanitizes commit subject by trimming, removing trailing periods, and lowercasing first character.
- **scope-rules.mjs** - Rules for inferring commit scope from file paths: domain (src/domain/), platform (src/platform/), ui (src/ui, src/components), application (src/features/), observability (src/infra/logging, monitoring, sentry), harness (scripts/ops/), docs (docs/), ci (.github/, ci/).
- **show-status.mjs** - Displays runner status including worktree ID, root path, lock status, git clean status, LINEAR_API_KEY presence, and run ID.
- **state-dir.mjs** - Runtime state directory path (/run/user/{uid}/symphony-runner).
- **symphony-bridge-model.mjs** - SYMPHONY_BRIDGE_MODEL constant from SYMPHONY_RUNNER_MODEL env var or "symphony/main".
- **symphony-bridge-url.mjs** - SYMPHONY_BRIDGE_URL constant (default http://127.0.0.1:4319/v1).
- **sync-fail-count-file.mjs** - Path to persistent sync fail count file.
- **sync-fail-count.mjs** - Tracks consecutive sync failure count for threshold-based recovery.
- **sync-failure-threshold.mjs** - Module that supports sync failure threshold. Exports `SYNC_FAILURE_THRESHOLD`.
- **sync-worktree-before-validation.mjs** - Syncs worktree with origin/main using git stash/patch pattern to rebase uncommitted changes onto latest main without merge commits. Handles conflicts by detecting CONFLICT or "patch does not apply" in output.
- **uid.mjs** - User ID from process.getuid() or default 1000.
- **workflow-path.mjs** - Module that supports workflow path. Exports `WORKFLOW_PATH`.
- **worktree-id.mjs** - Exports WORKTREE_ID variable and setWorktreeId function for worktree identification.
- **write-pre-validation-patch.mjs** - Writes git diff patch to temp file before validation sync.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/orchestration/symphony-runner/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
