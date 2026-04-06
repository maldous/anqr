# ANQR Linear Issue Review

## 1. Directory Overview

This directory contains automation for reviewing and updating specific Linear issues based on pre-defined completion checks. It provides a programmatic way to assess issue status, verify evidence files, and update issue states in Linear based on completion criteria.

## 2. File Summaries

### Facade Module

- **index.mjs** - Generated facade index that exports all public API members: `ROOT`, `ISSUES_TO_REVIEW`, `COMPLETION_CHECKS`, and `main` function from sibling modules.

### Main Implementation

- **main.mjs** - Core orchestration module that fetches all issues across states, iterates through the predefined issue list, validates evidence files, determines appropriate actions, and updates issue states in Linear with comments.

### Data Modules

- **issues-to-review.mjs** - Exports `ISSUES_TO_REVIEW` array containing the list of Linear issue identifiers to review (ANQ-1137, ANQ-1136, ANQ-1135, ANQ-1134, ANQ-1133, ANQ-1132, ANQ-1129, ANQ-1128, ANQ-1127, ANQ-1126).

- **completion-checks.mjs** - Exports `COMPLETION_CHECKS` object mapping each issue identifier to its assessment data including evidence file path, status (DOCUMENTED_NOT_FIXED, NO_EVIDENCE, COMPLETE, INFRASTRUCTURE_COMPLETE_VALIDATION_PENDING, VALIDATION_PENDING, IMPLEMENTED_AS_PART_OF_1129), reason, action (MARK_DONE, REOPEN_TO_BACKLOG, CHECK_IMPLEMENTATION), and optional comment text.

### Runtime Module

- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function via `await main()`.

### Utility Modules

- **logger.mjs** - Shared logger module using the project's standard logger from `../../../lib/logger.mjs`. Exports `logInfo` and `logError` functions.

- **root.mjs** - Path resolution utility exporting `ROOT` constant as `resolve(process.cwd())` for resolving relative paths from project root.

## 3. Overall Directory Function

This directory serves as an automated issue review system for the ANQR project. The workflow:

1. `main.mjs` loads predefined issues from `ISSUES_TO_REVIEW`
2. For each issue, it looks up the completion check data in `COMPLETION_CHECKS`
3. It fetches the current issue state from Linear across all possible states
4. It validates whether evidence files exist (if specified)
5. Based on the action type (MARK_DONE, REOPEN_TO_BACKLOG, CHECK_IMPLEMENTATION), it determines what state change is needed
6. It adds a comment to the issue documenting the review and updates the state

The directory supports batch review of multiple issues with predefined assessment criteria, enabling systematic cleanup of issues that may be stuck or need re-evaluation.

## 4. Usage Instructions

### Running the Review

```bash
# Via facade (recommended)
node ops/integrations/linear/review-specified-issues.mjs
```

Or directly:

```bash
node ops/integrations/linear/review-specified-issues/runtime.mjs
```

### Prerequisites

- Linear API credentials configured in environment
- Evidence files (if any) present at paths specified in completion checks
- Project root accessible for path resolution

### Output

The script prints:
- Progress through each issue with current state, priority, and assessment
- Evidence file validation status
- Summary of updates to be made
- Confirmation of each successful update

Actions taken:
- `MARK_DONE`: Moves issue to Done state with completion comment
- `REOPEN_TO_BACKLOG`: Moves issue to Backlog state with explanation comment
- `CHECK_IMPLEMENTATION`: If no evidence and not in terminal state, moves to Backlog for manual review

## 5. Dependencies

### Internal Dependencies

- **../linear-client.mjs** - Linear API client (`updateIssue`, `addComment`, `STATES`, `listIssuesByState`)
- **../../../lib/logger.mjs** - Logger factory for `logInfo`, `logError`
- Node.js built-ins: `node:path`, `node:fs`

### External Services

- **Linear** - Issue tracking and management platform

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid Linear API credentials in environment

## 6. Additional Comments

- **Batch Processing**: The script processes all issues in `ISSUES_TO_REVIEW` in a single run, making it suitable for periodic cleanup operations.

- **Evidence-Based**: Some issues have evidence files documenting completion. The script validates these exist before marking complete.

- **Terminal State Handling**: Issues already in "Done" or "Canceled" state are skipped even if checks exist.

- **Check Implementation**: Issues without evidence and not in terminal state get moved to Backlog with a comment requesting manual review.

- **Status Categories**: The completion checks use status values like COMPLETE, DOCUMENTED_NOT_FIXED, NO_EVIDENCE, INFRASTRUCTURE_COMPLETE_VALIDATION_PENDING, and IMPLEMENTED_AS_PART_OF_1129 to categorize issue state.

- **Action Types**: Actions include MARK_DONE (ready to close), REOPEN_TO_BACKLOG (needs manual work), and CHECK_IMPLEMENTATION (needs verification).