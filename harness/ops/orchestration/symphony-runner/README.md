# ANQR Symphony Runner

## 1. Directory Overview

This directory implements **ANQR Symphony Runner** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 57 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **acquire-lock.mjs** - Exports `acquireLock`, which acquires lock.
- **auto-detected-worktree-id.mjs** - Exports `autoDetectedWorktreeId`, `setAutoDetectedWorktreeId`, providing the reusable API for this directory concern.
- **classify-provider-failure.mjs** - Exports `classifyProviderFailure`, which implements classify provider failure.
- **current-branch-name-for-runner.mjs** - Exports `currentBranchNameForRunner`, which implements current branch name for runner.
- **cwd.mjs** - Exports `cwd`, which implements cwd.
- **default-allowed-dirty-path-patterns.mjs** - Exports `DEFAULT_ALLOWED_DIRTY_PATH_PATTERNS`, a shared constant used by sibling modules.
- **detect-worktree.mjs** - Exports `detectWorktree`, which detects worktree.
- **ensure-runtime-state-dir.mjs** - Exports `ensureRuntimeStateDir`, which ensures runtime state dir.
- **execute-issue.mjs** - Exports `executeIssue`, which implements execute issue.
- **expected-pattern.mjs** - Exports `expectedPattern`, which implements expected pattern.
- **get-repo-head-sha.mjs** - Exports `getRepoHeadSha`, which gets repo head sha.
- **get-runner-provider.mjs** - Exports `getRunnerProvider`, which gets runner provider.
- **get-working-tree-entries.mjs** - Exports `getWorkingTreeEntries`, which gets working tree entries.
- **get-working-tree-status.mjs** - Exports `getWorkingTreeStatus`, which gets working tree status.
- **git-commit.mjs** - Exports `gitCommit`, which implements git commit.
- **git-diff-names.mjs** - Exports `gitDiffNames`, which implements git diff names.
- **git-diff-stat.mjs** - Exports `gitDiffStat`, which implements git diff stat.
- **git-path.mjs** - Exports `gitPath`, which implements git path.
- **git-push-worktree-branch.mjs** - Exports `gitPushWorktreeBranch`, which implements git push worktree branch.
- **git-revert.mjs** - Exports `gitRevert`, which implements git revert.
- **header-max-length.mjs** - Exports `HEADER_MAX_LENGTH`, a shared constant used by sibling modules.
- **index.mjs** - Facade module that re-exports public members from `./cwd.mjs`, `./git-path.mjs`, `./worktree-id.mjs`, `./root.mjs`, `./expected-pattern.mjs`, `./root-matches-pattern.mjs`, and 46 more siblings.
- **infer-commit-scope.mjs** - Exports `inferCommitScope`, which implements infer commit scope.
- **is-allowed-dirty-path.mjs** - Exports `isAllowedDirtyPath`, which checks whether allowed dirty path.
- **is-baseline-repair-issue.mjs** - Exports `isBaselineRepairIssue`, which checks whether baseline repair issue.
- **is-discord-issue.mjs** - Exports `isDiscordIssue`, which checks whether discord issue.
- **is-process-alive.mjs** - Exports `isProcessAlive`, which checks whether process alive.
- **lease-ttl-ms.mjs** - Exports `LEASE_TTL_MS`, a shared constant used by sibling modules.
- **lock-file.mjs** - Exports `LOCK_FILE`, a shared constant used by sibling modules.
- **log-working-tree-entries.mjs** - Exports `logWorkingTreeEntries`, which implements log working tree entries.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **maybe-run-preflights.mjs** - Exports `maybeRunPreflights`, which implements maybe run preflights.
- **normalize-repo-path.mjs** - Exports `normalizeRepoPath`, which normalizes repo path.
- **parse-allowed-dirty-path-env.mjs** - Exports `parseAllowedDirtyPathEnv`, which parses allowed dirty path env.
- **pick-issue.mjs** - Exports `pickIssue`, which implements pick issue.
- **release-lock.mjs** - Exports `releaseLock`, which releases lock.
- **remove-temp-file.mjs** - Exports `removeTempFile`, which implements remove temp file.
- **root-matches-pattern.mjs** - Exports `rootMatchesPattern`, which implements root matches pattern.
- **root.mjs** - Exports `ROOT`, a shared constant used by sibling modules.
- **run-id.mjs** - Exports `RUN_ID`, a shared constant used by sibling modules.
- **run-sonar-post-commit.mjs** - Exports `runSonarPostCommit`, which runs sonar post commit.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **sanitize-commit-subject.mjs** - Exports `sanitizeCommitSubject`, which implements sanitize commit subject.
- **scope-rules.mjs** - Exports `SCOPE_RULES`, a shared constant used by sibling modules.
- **show-status.mjs** - Exports `showStatus`, which shows status.
- **state-dir.mjs** - Exports `STATE_DIR`, a shared constant used by sibling modules.
- **symphony-bridge-model.mjs** - Exports `SYMPHONY_BRIDGE_MODEL`, a shared constant used by sibling modules.
- **symphony-bridge-url.mjs** - Exports `SYMPHONY_BRIDGE_URL`, a shared constant used by sibling modules.
- **sync-fail-count-file.mjs** - Exports `SYNC_FAIL_COUNT_FILE`, a shared constant used by sibling modules.
- **sync-fail-count.mjs** - Exports `setSyncFailCount`, `syncFailCount`, providing the reusable API for this directory concern.
- **sync-failure-threshold.mjs** - Exports `SYNC_FAILURE_THRESHOLD`, a shared constant used by sibling modules.
- **sync-worktree-before-validation.mjs** - Exports `syncWorktreeBeforeValidation`, which implements sync worktree before validation.
- **uid.mjs** - Exports `uid`, which implements uid.
- **workflow-path.mjs** - Exports `WORKFLOW_PATH`, a shared constant used by sibling modules.
- **worktree-id.mjs** - Exports `WORKTREE_ID`, `setWorktreeId`, providing the reusable API for this directory concern.
- **write-pre-validation-patch.mjs** - Exports `writePreValidationPatch`, which writes pre validation patch.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include file-system access, network/API integration, subprocess execution, timer, scheduling, cooldown, or watchdog behavior, Linear integration, Discord integration, OpenClaw integration, Symphony integration, SonarQube integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/orchestration/symphony-runner/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:fs`, `node:path`
- **Internal relative modules** - `../../core/worktree-config.mjs`, `../../integrations/notifications/openclaw-discord.mjs`, `../../lib/logger.mjs`, `../../linear-client.mjs`, `../../symphony-agent.mjs`, `../../symphony-config.mjs`, `../../symphony-credit-gate.mjs`, `../../symphony-queue-control.mjs`, `../../symphony-state.mjs`, `../../symphony-validation.mjs`, `./acquire-lock.mjs`, `./auto-detected-worktree-id.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
