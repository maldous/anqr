# ANQR Linear Reopen Marked Issues

## 1. Directory Overview

This directory contains automation for reopening canceled Linear issues that have been marked for reevaluation. It scans canceled issues for specific markers ("REOPENED:" or "RE-EVALUATE:") and reopens them to Backlog state with a legacy issue notice comment. This helps ensure legacy issues are properly revalidated against current architecture and 1.0 Foundation principles before proceeding with implementation.

## 2. File Summaries

### Facade Module

- **index.mjs** - Generated facade index that exports `REOPEN_PATTERNS` from `./reopen-patterns.mjs` and `main` from `./main.mjs`. Provides the public API for this module.

### Runtime Module

- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function via `await main()`. This is the CLI entry point.

### Main Implementation

- **main.mjs** - Core logic that fetches all "Canceled" issues from Linear, scans their title and description for REOPENED or RE-EVALUATE markers, and reopens matching issues to Backlog state. Includes dry-run support, priority classification (high for REOPENED, medium for RE-EVALUATE), rate limiting between updates, and comprehensive logging.

### Pattern Definitions

- **reopen-patterns.mjs** - Exports `REOPEN_PATTERNS` object containing two regex patterns: `REOPENED: /REOPENED:/i` and `RE_EVALUATE: /RE-EVALUATE:/i` for detecting marker strings in issue content.

### Logging

- **logger.mjs** - Shared logger for this module's extracted members. Imports `createLogger` from `../../../lib/logger.mjs` and exports `logInfo`, `logWarn`, and `logError` functions.

## 3. Overall Directory Function

This directory serves as an automated cleanup tool for legacy issues in the Linear project. The workflow: `main.mjs` fetches all canceled issues, filters for those containing "REOPENED:" or "RE-EVALUATE:" markers in their title or description, classifies them by priority, and reopens them to Backlog state with a detailed legacy issue reevaluation comment.

Key features:

- Scans canceled issues for marker patterns
- Priority classification (high/medium)
- Dry-run mode for testing
- Rate limiting to avoid API throttling
- Detailed reevaluation comment with required actions

## 4. Usage Instructions

### Running the Script

```bash
# Via facade (recommended)
node ops/integrations/linear/reopen-marked-issues.mjs
```

Or directly:

```bash
node ops/integrations/linear/reopen-marked-issues/runtime.mjs
```

### Dry Run Mode

To test without making actual Linear API changes:

```bash
node ops/integrations/linear/reopen-marked-issues/runtime.mjs --dry-run
```

### Output

The script prints progress with icons:

- `[INFO]` - Informational messages (start, completion counts)
- `[WARN]` - Issues found to reopen with priority levels
- `[ERROR]` - Failed reopen attempts

A summary is printed showing success and failure counts.

## 5. Dependencies

### Internal Dependencies

- **../linear-client.mjs** - Linear API client (`listIssuesByState`, `updateIssue`, `addComment`, `STATES`)
- **../../../lib/logger.mjs** - Logger factory for `logInfo`, `logWarn`, `logError`

### External Services

- **Linear** - Issue tracking and management platform

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid Linear API credentials in environment

## 6. Additional Comments

- **Legacy Issue Notice**: When reopening, a comment is added explaining that the issue needs reevaluation against current architecture, 1.0 Foundation principles, and current codebase state.

- **Priority Classification**: Issues with "REOPENED:" marker get high priority, while "RE-EVALUATE:" gets medium priority.

- **Rate Limiting**: A 200ms delay between issue updates prevents API throttling.

- **Required Actions**: The reopening comment includes explicit steps: verify issue still exists, review against current architecture, check 1.0 scope, and update or close if no longer relevant.