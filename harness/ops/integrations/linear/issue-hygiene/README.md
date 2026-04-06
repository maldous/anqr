# ANQR Linear Issue Hygiene

## 1. Directory Overview

This directory contains the Linear issue hygiene automation module for the ANQR (Agentic Number Query Runner) harness. It manages the cleanup and archival of high-volume issue comments, specifically targeting issues that accumulate failure comments from automated agent execution. The module detects systemic failure patterns and flags issues requiring human investigation.

## 2. File Summaries

### Facade Module (Auto-Generated)

- **index.mjs** - Facade exporting all public API members including constants (`DEFAULT_COMMENT_THRESHOLD`, `SYSTEMIC_FAILURE_THRESHOLD`, `MAX_DESCRIPTION_LENGTH`, `ANALYSIS_DELAY_MS`, `ACTION_DELAY_MS`, `FAILURE_PATTERNS`) and functions (`parseArgs`, `analyzeComments`, `buildFailureSummary`, `analyzeIssue`, `applyHygiene`, `main`).

- **runtime.mjs** - Runtime carry-forward that imports and executes the main function via `await main()`.

### Core Implementation Files

- **main.mjs** - Main orchestration module. Fetches open issues from Linear, iterates through them to analyze comment patterns, determines hygiene needs, applies archival actions, and prints a comprehensive summary. Supports `--dry-run` and `--threshold=N` flags.

- **analyze-issue.mjs** - Core analysis logic for a single issue. Fetches issue details including comments, checks if comment count exceeds threshold, analyzes failure patterns, determines if failure is systemic, and returns a recommendation (`FLAG_FOR_HUMAN_REVIEW`, `ARCHIVE_AND_CONSOLIDATE`, or `ARCHIVE_ONLY`).

- **analyze-comments.mjs** - Analyzes a list of comments to extract failure patterns. Counts failures, stale alerts, unique failure signatures (extracted from code blocks), and tracks first/last comment timestamps.

- **apply-hygiene.mjs** - Applies hygiene actions to an issue. Updates issue description with archived failure summary, adds a hygiene notification comment, and flags systemic failures for human review.

- **build-failure-summary.mjs** - Constructs the Markdown summary of failure history to append to issue description. Includes total comments, failure count, stale alerts, unique signatures, systemic failure warning, timeline (first/last failure dates), and recent failure signatures.

### Configuration Constants

- **default-comment-threshold.mjs** - Default comment threshold (15) for triggering hygiene intervention.

- **systemic-failure-threshold.mjs** - Systemic failure threshold (10 unique failure signatures) for flagging issues requiring human review.

- **max-description-length.mjs** - Maximum description length (50000 chars) to prevent exceeding Linear's limits.

- **action-delay-ms.mjs** - Delay between API actions (200ms) for rate limiting.

- **analysis-delay-ms.mjs** - Delay between issue analysis API calls (100ms).

### Utilities

- **parse-args.mjs** - Parses command-line arguments for `--dry-run` and `--threshold=N` options.

- **failure-patterns.mjs** - Regex patterns for identifying failure comments: `stillFailing`, `stale`, `harnessFail`, `guardian`.

- **logger.mjs** - Shared logger module using the project's logger.

### Test Files

- **main.spec.ts** - Vitest test suite validating main.mjs hygiene detection, dry-run behavior, and systemic failure detection.

## 3. Overall Directory Function

This directory serves as an automated cleanup layer for Linear issues that accumulate excessive failure comments from automated agent execution. The workflow: `main.mjs` fetches all open issues (excluding Done and Canceled), iterates through them analyzing comment patterns via `analyzeIssue`, and applies hygiene actions via `applyHygiene` for issues exceeding the comment threshold.

Key capabilities:
- **Comment archival**: Moves failure comments from the comment thread to the issue description, keeping the thread clean while preserving history
- **Systemic failure detection**: Identifies issues with 10+ unique failure signatures and flags them for human review
- **Dry-run support**: Allows testing without making actual API modifications
- **Configurable threshold**: Supports `--threshold=N` to customize when hygiene triggers

The module works in conjunction with linear-guardian.mjs (governance) to track and escalate issues, but focuses on comment hygiene rather than issue state management.

## 4. Usage Instructions

### Running Issue Hygiene

```bash
# Via facade (recommended)
node ops/integrations/linear/issue-hygiene.mjs
```

Or directly:

```bash
node ops/integrations/linear/issue-hygiene/runtime.mjs
```

### Dry Run Mode

To test without making actual Linear API modifications:

```bash
node ops/integrations/linear/issue-hygiene.mjs --dry-run
```

### Custom Threshold

To change the comment threshold (default is 15):

```bash
node ops/integrations/linear/issue-hygiene.mjs --threshold=20
```

### Combined Options

```bash
node ops/integrations/linear/issue-hygiene.mjs --dry-run --threshold=25
```

### Prerequisites

- Valid Linear API credentials configured
- Network access to Linear API
- Open issues in Linear to analyze

### Output

The module prints:
- Progress updates during analysis
- Hygiene analysis results (systemic failures and archive candidates)
- Summary showing total analyzed, issues needing hygiene, systemic failures flagged, and issues archived

## 5. Dependencies

### Internal Dependencies

- **../linear-client.mjs** - Linear API client (`listIssuesByState`, `getIssueDetail`, `updateIssue`, `addComment`)
- **../../../lib/logger.mjs** - Logger factory

### External Services

- **Linear** - Issue tracking and management platform

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid Linear API credentials in environment

## 6. Additional Comments

- **Fail-Safe Design**: Module only archives issues with actual failure comments (failureCount > 0). Issues with many comments but no failures are skipped.

- **Systemic Failure Detection**: Issues with 10+ unique failure signatures are flagged for human review, indicating a fundamental problem requiring investigation beyond simple retry.

- **Description Truncation**: If archived summary would exceed Linear's 50000 char limit, the description is truncated with a "[Truncated]" marker.

- **Rate Limiting**: Built-in delays (100ms analysis, 200ms action) prevent overwhelming the Linear API.

- **Original History Preserved**: Comment history remains in Linear's version history; the archive in description is supplementary for quick analysis.

- **State Filtering**: Analyzes issues in states: Backlog, Todo, In Progress, In Review, Blocked, and Human Review. Excludes Done and Canceled.