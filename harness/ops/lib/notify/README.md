# ANQR Notify Library

## 1. Directory Overview

This directory contains the notification library for the ANQR (Agentic Number Query Runner) harness. It provides email notification capabilities with deduplication, rate limiting, and Linear issue integration. The library uses `msmtp` to send email notifications and maintains local state to prevent notification spam.

## 2. File Summaries

### Core Infrastructure

- **dirname.mjs** - ESM-compatible `__dirname` polyfill using `fileURLToPath` and `path.dirname`.
- **project-root.mjs** - Resolves project root directory by traversing up 4 levels from the module location.
- **state-dir.mjs** - Defines state directory path as `reports/notify` under PROJECT_ROOT.
- **rate-limit-file.mjs** - Defines the state file path as `state.json` within STATE_DIR.
- **ensure-dir.mjs** - Utility to ensure a directory exists, creating it recursively if needed.

### Configuration

- **linear-workspace.mjs** - Exports LINEAR_WORKSPACE from environment variable (default: "anqr").
- **dedup-window-ms.mjs** - Deduplication window constant: 3,600,000ms (1 hour).
- **recipient.mjs** - Exports RECIPIENT email address from `ANQR_NOTIFY_EMAIL` env var (default: matthew.aldous@gmail.com).

### State Management

- **load-state.mjs** - Loads notification state from `state.json`, returns `{ sends: [] }` if file doesn't exist.
- **save-state.mjs** - Saves notification state to `state.json` with pretty-printed JSON formatting.

### Deduplication & Rate Limiting

- **check-dedup.mjs** - Deduplication check function that:
  - Cleans entries older than 24 hours
  - Checks if same subject was sent within DEDUP_WINDOW_MS (1 hour)
  - Returns `{ allowed: false, reason: "..." }` if duplicate, otherwise `{ allowed: true }`

### Formatting & Utilities

- **logger.mjs** - Shared logger using the project's logger library, exports `logInfo` and `logError`.
- **linear-issue-url.mjs** - Generates Linear issue URLs in format: `https://linear.app/{workspace}/issue/{identifier}`.
- **format-issue-line.mjs** - Formats notification lines with:
  - Bullet point with identifier and optional title
  - Optional metadata lines
  - URL link
  - Optional snippet (truncated at 600 chars with "..." if needed)

### Main Notification Module

- **send-notification.mjs** - Core notification function that:
  - Checks for msmtp availability
  - Applies deduplication logic
  - Formats email with severity tag ([CRITICAL], [WARN], or none)
  - Adds custom headers (X-ANQR-Severity, X-ANQR-Timestamp)
  - Sends via msmtp with 30-second timeout
  - Records send in state for deduplication

### Facade Index

- **index.mjs** - Generated facade that exports all public API members:
  - `__dirname`, `PROJECT_ROOT`, `STATE_DIR`, `RATE_LIMIT_FILE`
  - `RECIPIENT`, `DEDUP_WINDOW_MS`, `LINEAR_WORKSPACE`
  - `ensureDir`, `loadState`, `saveState`, `checkDedup`
  - `linearIssueUrl`, `formatIssueLine`, `sendNotification`

## 3. Overall Directory Function

This directory provides the notification subsystem for the ANQR harness. The modules work together to enable reliable email notifications with built-in protection against notification spam:

1. **Configuration**: Environment-based configuration for recipient email and Linear workspace
2. **State Management**: Persistent state storage for tracking sent notifications
3. **Deduplication**: Prevents duplicate notifications within a 1-hour window based on subject
4. **Rate Limiting**: Maintains history of sent notifications with 24-hour retention
5. **Formatting**: Consistent formatting for notifications including Linear issue links
6. **Delivery**: Uses system msmtp for email delivery

The notification system integrates with Linear by generating issue URLs and can be called with different severity levels (info, warn, critical).

## 4. Usage Instructions

### Import the notification module

```javascript
import { sendNotification } from "./ops/lib/notify/index.mjs";
```

### Send a notification

```javascript
// Basic info notification
sendNotification({
  subject: "Queue processing complete",
  body: "Processed 25 issues successfully"
});

// Warning notification
sendNotification({
  subject: "High queue depth",
  body: "Queue depth has exceeded 12 issues",
  severity: "warn"
});

// Critical notification
sendNotification({
  subject: "Worktree health check failed",
  body: "Worktree 'issue-123' is stuck in 'in_progress'",
  severity: "critical"
});
```

### Use formatting utilities

```javascript
import { formatIssueLine, linearIssueUrl } from "./ops/lib/notify/index.mjs";

// Format an issue for notification
const line = formatIssueLine({
  identifier: "ANQR-123",
  title: "Database connection error",
  snippet: "Connection refused: could not reach database server",
  meta: ["priority: high", "assigned: alice"]
});

// Generate Linear URL
const url = linearIssueUrl("ANQR-456");
```

### Check deduplication

```javascript
import { loadState, checkDedup } from "./ops/lib/notify/index.mjs";

const state = loadState();
const result = checkDedup(state, "Test notification subject");

if (result.allowed) {
  // Send notification
} else {
  console.log("Skipped:", result.reason);
}
```

## 5. Dependencies

### Runtime Dependencies

- **Node.js** - ESM modules with .mjs extension
- **msmtp** - External mail transfer agent must be installed on the system
  - Check with: `which msmtp`
  - Required for email delivery

### Environment Variables

- **ANQR_NOTIFY_EMAIL** - Override default recipient email (default: matthew.aldous@gmail.com)
- **LINEAR_WORKSPACE** - Override Linear workspace identifier (default: "anqr")

### Internal Dependencies

- **../logger.mjs** - Project logger module used by logger.mjs

### State File

- **reports/notify/state.json** - Created automatically on first notification send

## 6. Additional Comments

- **Fail-Safe Design**: If msmtp is not found, `sendNotification` returns `{ sent: false, reason: "msmtp not found" }` instead of throwing an error.
- **Deduplication Strategy**: The deduplication uses subject matching within a 1-hour window. State entries older than 24 hours are automatically cleaned up.
- **Email Format**: Notifications are sent as plain text with UTF-8 encoding and custom headers for severity tracking.
- **Severity Tags**: Subject lines are prefixed with `[CRITICAL]` or `[WARN]` based on severity level.
- **Snippet Truncation**: Long issue snippets are truncated at 600 characters with "..." suffix to keep notifications concise.
- **State Persistence**: State is saved after every successful send to enable deduplication across process restarts.
- **Timeout Protection**: msmtp invocation has a 30-second timeout to prevent hanging on mail server issues.