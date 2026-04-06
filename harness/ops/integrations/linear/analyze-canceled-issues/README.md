# ANQR Linear Analyze Canceled Issues

## 1. Directory Overview

This directory contains automation for analyzing canceled Linear issues to identify which ones may have been incorrectly canceled and should potentially be reopened. It provides pattern-based classification to distinguish between legitimately canceled issues and those requiring manual review or re-evaluation.

## 2. File Summaries

### Facade Module

- **index.mjs** - Generated facade index that exports the public API: `REOPEN_PATTERNS` from reopen-patterns.mjs, `CORRECT_CANCEL_PATTERNS` from correct-cancel-patterns.mjs, and `main` from main.mjs.

### Core Implementation Files

- **main.mjs** - Main orchestration logic. Fetches all issues in "Canceled" state from Linear using listIssuesByState, then categorizes each issue into three buckets: `shouldReopen` (issues with reopening markers), `correctlyCanceled` (issues with valid cancellation reasons), and `needsReview` (issues requiring manual assessment). Outputs detailed analysis including issue identifiers, titles, reasons, labels, creation dates, and descriptions. Returns structured analysis data.

- **reopen-patterns.mjs** - Defines REOPEN_PATTERNS object containing regex patterns for identifying issues that should be reopened: REOPENED (explicit reopen marker), PARENT_ISSUE (parent issue that should remain open for tracking), RE_EVALUATE (re-evaluation marker), and ACTIVE_WORK (deferred work that is documented).

- **correct-cancel-patterns.mjs** - Defines CORRECT_CANCEL_PATTERNS object containing regex patterns for correctly canceled issues: NOT_IN_SCOPE (not in 1.0 claim), SUPERSEDED (superseded by other work), HUMAN_ONLY (human-only task), and EXPLICIT_CANCEL (explicit cancel marker).

- **logger.mjs** - Shared logger module that imports createLogger from the lib logger and exports logInfo and logWarn functions for consistent logging throughout the module.

### Runtime

- **runtime.mjs** - Generated runtime carry-forward that imports main from index.mjs and executes it, providing a CLI entry point for the module.

## 3. Overall Directory Function

This directory serves as a governance automation tool for the Linear issue management workflow. It helps maintain issue hygiene by identifying canceled issues that may have been prematurely closed or lack proper documentation.

The analysis logic works by:

1. Fetching all canceled issues from Linear
2. Checking each issue against REOPEN_PATTERNS to identify those needing reopening (high/medium priority)
3. Checking against CORRECT_CANCEL_PATTERNS to validate legitimate cancellations
4. Flagging issues without clear cancellation reasons for manual review

This enables the team to systematically review the backlog of canceled issues, ensuring important work isn't lost and cancellation decisions are properly documented.

## 4. Usage Instructions

### Running the Analysis

```bash
# Via runtime (recommended)
node ops/integrations/linear/analyze-canceled-issues/runtime.mjs
```

Or directly:

```bash
node ops/integrations/linear/analyze-canceled-issues/main.mjs
```

### Programmatic Usage

```javascript
import {
  main,
  REOPEN_PATTERNS,
  CORRECT_CANCEL_PATTERNS,
} from "./ops/integrations/linear/analyze-canceled-issues/index.mjs";

const analysis = await main();
// Returns: { shouldReopen: [], correctlyCanceled: [], needsReview: [] }
```

### Interpreting Output

The tool outputs four sections:

- **SHOULD BE REOPENED**: Issues with explicit reopening markers (high/medium priority)
- **NEEDS MANUAL REVIEW**: Issues without clear cancellation reasons or parent issues
- **CORRECTLY CANCELED**: Issues with valid cancellation patterns
- **SUMMARY**: Total counts for each category

## 5. Dependencies

### Internal Dependencies

- **../linear-client.mjs** - For listIssuesByState function to fetch canceled issues from Linear
- **../../../lib/logger.mjs** - For createLogger function
- **./correct-cancel-patterns.mjs** - For CORRECT_CANCEL_PATTERNS regex definitions
- **./reopen-patterns.mjs** - For REOPEN_PATTERNS regex definitions

### External Services

- **Linear** - Issue tracking platform (requires API credentials configured in linear-client.mjs)

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid Linear API credentials
- Network access to Linear API

## 6. Additional Comments

- **Priority System**: Reopen recommendations are classified as high priority (REOPENED marker) or medium priority (RE-EVALUATE marker), allowing team members to focus on the most critical cases first.

- **Pattern Matching Strategy**: The analysis uses a layered approach - first checking for reopening markers, then for correct cancellation patterns, and finally flagging issues lacking documentation.

- **Description Threshold**: Issues with descriptions shorter than 50 characters are automatically flagged for review, as adequate cancellation reasoning should be documented.

- **Parent Issue Handling**: Issues with PARENT markers that don't have explicit CANCELED markers are flagged for review, as parent issues typically need to remain open for tracking purposes.

- **Output Limit**: The needsReview section displays a maximum of 10 issues with a count of remaining issues to avoid overwhelming output.
