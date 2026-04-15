# Symphony Runner

## Purpose

Worktree-local executor that runs already-assigned work inside an isolated checkout, performs validation, commits/pushes worktree results, and prepares candidates for serial integration.

## Contents

- 54 immediate files
- 1 child directory

## Key Files

- `acquire-lock.mjs` - Exports `acquireLock`, the main helper defined in this file.
- `auto-detected-worktree-id.mjs` - Exports `setAutoDetectedWorktreeId`, the main helper defined in this file.
- `classify-provider-failure.mjs` - Exports `classifyProviderFailure`, the main helper defined in this file.
- `current-branch-name-for-runner.mjs` - Exports `currentBranchNameForRunner`, the main helper defined in this file.
- `cwd.mjs` - Exports `cwd`, a shared constant or state value used by sibling modules.
- `default-allowed-dirty-path-patterns.mjs` - Exports `DEFAULT_ALLOWED_DIRTY_PATH_PATTERNS`, a shared constant or state value used by sibling modules.
- `detect-worktree.mjs` - Exports `detectWorktree`, the main helper defined in this file.
- `ensure-runtime-state-dir.mjs` - Exports `ensureRuntimeStateDir`, the main helper defined in this file.
- `execute-issue.mjs` - Exports `executeIssue`, the main helper defined in this file.
- `expected-pattern.mjs` - Exports `expectedPattern`, a shared constant or state value used by sibling modules.
- `get-repo-head-sha.mjs` - Exports `getRepoHeadSha`, the main helper defined in this file.
- `get-runner-provider.mjs` - Exports `getRunnerProvider`, the main helper defined in this file.
- `get-working-tree-entries.mjs` - Exports `getWorkingTreeEntries`, the main helper defined in this file.
- `get-working-tree-status.mjs` - Exports `getWorkingTreeStatus`, the main helper defined in this file.
- `git-commit.mjs` - Exports `gitCommit`, the main helper defined in this file.
- `git-diff-names.mjs` - Exports `gitDiffNames`, the main helper defined in this file.
- `git-diff-stat.mjs` - Exports `gitDiffStat`, the main helper defined in this file.
- `git-path.mjs` - Exports `gitPath`, a shared constant or state value used by sibling modules.
- `git-push-worktree-branch.mjs` - Exports `gitPushWorktreeBranch`, the main helper defined in this file.
- `git-revert.mjs` - Exports `gitRevert`, the main helper defined in this file.
- `header-max-length.mjs` - Exports `HEADER_MAX_LENGTH`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `infer-commit-scope.mjs` - Exports `inferCommitScope`, the main helper defined in this file.
- `is-allowed-dirty-path.mjs` - Exports `isAllowedDirtyPath`, the main helper defined in this file.
- `is-process-alive.mjs` - Exports `isProcessAlive`, the main helper defined in this file.
- `lease-ttl-ms.mjs` - Exports `LEASE_TTL_MS`, a shared constant or state value used by sibling modules.
- `lock-file.mjs` - Exports `LOCK_FILE`, a shared constant or state value used by sibling modules.
- `log-working-tree-entries.mjs` - Exports `logWorkingTreeEntries`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `maybe-run-preflights.mjs` - Exports `maybeRunPreflights`, the main helper defined in this file.
- `normalize-repo-path.mjs` - Exports `normalizeRepoPath`, the main helper defined in this file.
- `parse-allowed-dirty-path-env.mjs` - Exports `parseAllowedDirtyPathEnv`, the main helper defined in this file.
- `release-lock.mjs` - Exports `releaseLock`, the main helper defined in this file.
- `remove-temp-file.mjs` - Exports `removeTempFile`, the main helper defined in this file.
- `root-matches-pattern.mjs` - Exports `rootMatchesPattern`, a shared constant or state value used by sibling modules.
- `root.mjs` - Exports `ROOT`, a shared constant or state value used by sibling modules.
- `run-id.mjs` - Exports `RUN_ID`, a shared constant or state value used by sibling modules.
- `run-sonar-post-commit.mjs` - Exports `runSonarPostCommit`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `sanitize-commit-subject.mjs` - Exports `sanitizeCommitSubject`, the main helper defined in this file.
- `scope-rules.mjs` - Exports `SCOPE_RULES`, a shared constant or state value used by sibling modules.
- `show-status.mjs` - Exports `showStatus`, the main helper defined in this file.
- `state-dir.mjs` - Exports `STATE_DIR`, a shared constant or state value used by sibling modules.
- `symphony-bridge-model.mjs` - Exports `SYMPHONY_BRIDGE_MODEL`, a shared constant or state value used by sibling modules.
- `symphony-bridge-url.mjs` - Exports `SYMPHONY_BRIDGE_URL`, a shared constant or state value used by sibling modules.
- `sync-fail-count-file.mjs` - Exports `SYNC_FAIL_COUNT_FILE`, a shared constant or state value used by sibling modules.
- `sync-fail-count.mjs` - Exports `setSyncFailCount`, the main helper defined in this file.
- `sync-failure-threshold.mjs` - Exports `SYNC_FAILURE_THRESHOLD`, a shared constant or state value used by sibling modules.
- `sync-worktree-before-validation.mjs` - Re-export facade that assembles the public surface for this directory.
- `uid.mjs` - Exports `uid`, a shared constant or state value used by sibling modules.
- `workflow-path.mjs` - Exports `WORKFLOW_PATH`, a shared constant or state value used by sibling modules.
- `worktree-id.mjs` - Exports `setWorktreeId`, the main helper defined in this file.
- `write-pre-validation-patch.mjs` - Exports `writePreValidationPatch`, the main helper defined in this file.

## Subdirectories

- `sync-worktree-before-validation/` - Sync Worktree Before Validation scope; immediate files include `git.mjs`, `index.mjs`, `sync-worktree-before-validation.mjs`.

## Operational Notes

- This directory now reflects the post-Workstream A model where the runner executes assigned work instead of globally self-picking runnable issues.
- Sticky repair remains a local executor concern, but global admission is expected to come from the scheduler.

## Review Focus

Check that the runner behaves as a pure executor of claimed work, with only local repair handling and no global dispatch authority.
