# ANQR Linear Issue Hygiene

## 1. Directory Overview

This directory contains the Linear issue hygiene automation module for the ANQR (Agentic Number
Query Runner) harness. It manages the cleanup and archival of high-volume issue comments,
specifically targeting issues that accumulate failure comments from automated agent execution. The
module detects systemic failure patterns and flags issues requiring human investigation. It
currently contains 15 files and 0 subdirectories.

## 2. File Summaries

### Files

- **action-delay-ms.mjs** - Delay between API actions (200ms) for rate limiting.
- **analysis-delay-ms.mjs** - Delay between issue analysis API calls (100ms).
- **analyze-comments.mjs** - Analyzes a list of comments to extract failure patterns. Counts failures, stale alerts, unique failure signatures (extracted from code blocks), and tracks first/last comment timestamps.
- **analyze-issue.mjs** - Core analysis logic for a single issue. Fetches issue details including comments, checks if comment count exceeds threshold, analyzes failure patterns, determines if failure is systemic, and returns a recommendation (`FLAG_FOR_HUMAN_REVIEW`, `ARCHIVE_AND_CONSOLIDATE`, or `ARCHIVE_ONLY`).
- **apply-hygiene.mjs** - Applies hygiene actions to an issue. Updates issue description with archived failure summary, adds a hygiene notification comment, and flags systemic failures for human review.
- **build-failure-summary.mjs** - Constructs the Markdown summary of failure history to append to issue description. Includes total comments, failure count, stale alerts, unique signatures, systemic failure warning, timeline (first/last failure dates), and recent failure signatures.
- **default-comment-threshold.mjs** - Default comment threshold (15) for triggering hygiene intervention.
- **failure-patterns.mjs** - Regex patterns for identifying failure comments: `stillFailing`, `stale`, `harnessFail`, `guardian`.
- **index.mjs** - Facade exporting all public API members including constants (`DEFAULT_COMMENT_THRESHOLD`, `SYSTEMIC_FAILURE_THRESHOLD`, `MAX_DESCRIPTION_LENGTH`, `ANALYSIS_DELAY_MS`, `ACTION_DELAY_MS`, `FAILURE_PATTERNS`) and functions (`parseArgs`, `analyzeComments`, `buildFailureSummary`, `analyzeIssue`, `applyHygiene`, `main`).
- **logger.mjs** - Shared logger module using the project's logger.
- **main.mjs** - Main orchestration module. Fetches open issues from Linear, iterates through them to analyze comment patterns, determines hygiene needs, applies archival actions, and prints a comprehensive summary. Supports `--dry-run` and `--threshold=N` flags.
- **max-description-length.mjs** - Maximum description length (50000 chars) to prevent exceeding Linear's limits.
- **parse-args.mjs** - Parses command-line arguments for `--dry-run` and `--threshold=N` options.
- **runtime.mjs** - Runtime carry-forward that imports and executes the main function via `await main()`.
- **systemic-failure-threshold.mjs** - Systemic failure threshold (10 unique failure signatures) for flagging issues requiring human review.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/linear/issue-hygiene/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
